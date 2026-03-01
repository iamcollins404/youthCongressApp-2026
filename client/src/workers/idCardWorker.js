import html2canvas from 'html2canvas';
import JSZip from 'jszip';

self.onmessage = async (e) => {
  const { tickets, batchSize } = e.data;
  const zip = new JSZip();
  const totalBatches = Math.ceil(tickets.length / batchSize);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, tickets.length);
    const batch = tickets.slice(start, end);

    const batchPromises = batch.map(async (ticket) => {
      if (!ticket.passportPhoto) {
        self.postMessage({
          type: 'warning',
          message: `Skipping ticket ${ticket.id} - No passport photo available`
        });
        return null;
      }

      const idCardData = {
        photoUrl: ticket.passportPhoto?.url || ticket.passportPhoto || '',
        name: `${ticket.firstName} ${ticket.surname}`,
        id: ticket.id,
        conference: ticket.conference,
        phone: ticket.contactNumber,
      };

      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
          <div style="
            width: 350px;
            height: 600px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 100px;
            font-family: Montserrat, Arial, sans-serif;
          ">
            <!-- Hexagon Photo -->
            <div style="
              width: 180px;
              height: 210px;
              clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: hidden;
            ">
              <img src="${idCardData.photoUrl}" alt="ID" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <!-- Name -->
            <div style="
              font-weight: 800;
              font-size: 32px;
              margin-bottom: 1px;
              text-align: center;
              color: #23234c;
              letter-spacing: 0.5px;
              padding: 0 20px;
              line-height: 1.1;
            ">${idCardData.name}</div>
            <!-- Details -->
            <div style="
              font-size: 20px;
              margin-bottom: 40px;
              width: 90%;
              padding: 18px 24px;
              color: #23234c;
            ">
              <div style="margin-bottom: 10px"><b style="color:#23234c">ID No</b>: ${idCardData.id}</div>
              <div style="margin-bottom: 10px"><b style="color:#23234c">Conference</b>: ${idCardData.conference}</div>
              <div><b style="color:#23234c">Phone</b>: ${idCardData.phone}</div>
            </div>
          </div>
        `;
        
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          allowTaint: true,
          imageTimeout: 5000
        });

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.9));
        if (blob) {
          zip.file(`id-card-${ticket.id}.png`, blob);
        }
      } catch (error) {
        self.postMessage({
          type: 'error',
          message: `Error generating ID card for ${ticket.id}: ${error.message}`
        });
      }
    });

    await Promise.all(batchPromises);
    
    // Report progress
    self.postMessage({
      type: 'progress',
      progress: Math.round(((batchIndex + 1) / totalBatches) * 100)
    });

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Generate zip file
  self.postMessage({ type: 'status', message: 'Creating zip file...' });
  const content = await zip.generateAsync({ type: 'blob' });
  
  // Send the zip file back to the main thread
  self.postMessage({
    type: 'complete',
    blob: content
  }, [content]);
}; 