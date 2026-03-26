import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InspectionData {
  id: number;
  vehicleNumber: string;
  inspectionDate: string;
  overallStatus: string;
  driverCompleted: boolean;
  equipmentOfficerCompleted: boolean;
  nurseCompleted: boolean;
  hodApproved: boolean;
  remarks?: string;
  items?: any[];
}

export async function exportInspectionToPDF(inspection: InspectionData) {
  try {
    // Create a temporary container for PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';

    // Build HTML content
    container.innerHTML = `
      <div style="padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; margin-bottom: 5px;">Bangkok Siriroj Hospital</h1>
          <h2 style="font-size: 20px; margin-bottom: 10px;">รายงานการตรวจสอบรถพยาบาล</h2>
          <h3 style="font-size: 16px; color: #666;">Ambulance Inspection Report</h3>
        </div>

        <div style="margin-bottom: 20px; border: 2px solid #1e40af; padding: 15px; border-radius: 8px;">
          <div style="margin-bottom: 10px;">
            <strong style="display: inline-block; width: 200px;">Vehicle Number / หมายเลขรถ:</strong>
            <span style="font-size: 18px; font-weight: bold;">${inspection.vehicleNumber}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="display: inline-block; width: 200px;">Date / วันที่:</strong>
            <span>${new Date(inspection.inspectionDate).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="display: inline-block; width: 200px;">Status / สถานะ:</strong>
            <span style="padding: 5px 15px; border-radius: 20px; background-color: ${
              inspection.overallStatus === 'ready' ? '#dcfce7' :
              inspection.overallStatus === 'monitor' ? '#fef3c7' : '#fee2e2'
            }; color: ${
              inspection.overallStatus === 'ready' ? '#166534' :
              inspection.overallStatus === 'monitor' ? '#92400e' : '#991b1b'
            }; font-weight: bold;">
              ${inspection.overallStatus === 'ready' ? 'Ready / พร้อมใช้' :
                inspection.overallStatus === 'monitor' ? 'Monitor / ติดตาม' : 'Not Ready / ไม่พร้อม'}
            </span>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 10px; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">
            Inspection Progress / ความคืบหน้าการตรวจสอบ
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Driver / เจ้าหน้าที่ยานพาหนะ</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center; background-color: ${inspection.driverCompleted ? '#dcfce7' : '#fee2e2'};">
                ${inspection.driverCompleted ? '✓ Completed / เสร็จสิ้น' : '✗ Pending / รอดำเนินการ'}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Equipment Officer / เจ้าหน้าที่อุปกรณ์</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center; background-color: ${inspection.equipmentOfficerCompleted ? '#dcfce7' : '#fee2e2'};">
                ${inspection.equipmentOfficerCompleted ? '✓ Completed / เสร็จสิ้น' : '✗ Pending / รอดำเนินการ'}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Nurse / พยาบาล</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center; background-color: ${inspection.nurseCompleted ? '#dcfce7' : '#fee2e2'};">
                ${inspection.nurseCompleted ? '✓ Completed / เสร็จสิ้น' : '✗ Pending / รอดำเนินการ'}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">HOD Approval / อนุมัติโดย HOD</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; background-color: ${inspection.hodApproved ? '#dcfce7' : '#fee2e2'};">
                ${inspection.hodApproved ? '✓ Approved / อนุมัติแล้ว' : '✗ Not Approved / ยังไม่อนุมัติ'}
              </td>
            </tr>
          </table>
        </div>

        ${inspection.remarks ? `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <strong style="display: block; margin-bottom: 5px;">Remarks / หมายเหตุ:</strong>
            <p style="margin: 0;">${inspection.remarks}</p>
          </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
          <p>Generated on ${new Date().toLocaleString('th-TH')}</p>
          <p>Bangkok Siriroj Hospital - Ambulance Inspection System</p>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Save the PDF
    const fileName = `Inspection_${inspection.vehicleNumber}_${inspection.inspectionDate}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error };
  }
}

export async function exportMultipleInspectionsToPDF(inspections: InspectionData[]) {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    for (let i = 0; i < inspections.length; i++) {
      const inspection = inspections[i];

      // Create temporary container for each inspection
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.style.padding = '20px';
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'Arial, sans-serif';

      container.innerHTML = `
        <div style="padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="font-size: 20px; margin-bottom: 5px;">${inspection.vehicleNumber}</h2>
            <p style="color: #666;">${inspection.inspectionDate}</p>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Status:</strong>
            <span style="padding: 3px 10px; background-color: ${
              inspection.overallStatus === 'ready' ? '#dcfce7' : '#fee2e2'
            }; border-radius: 12px;">
              ${inspection.overallStatus}
            </span>
          </div>
        </div>
      `;

      document.body.appendChild(container);
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' });
      document.body.removeChild(container);

      if (i > 0) {
        pdf.addPage();
      }

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }

    const fileName = `Inspections_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error };
  }
}
