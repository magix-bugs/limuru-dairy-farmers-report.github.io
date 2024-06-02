document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reportData = JSON.parse(decodeURIComponent(urlParams.get('reports')));
  
    const reportContainer = document.getElementById('report-container');
    const loadingOverlay = document.getElementById('loading-overlay');
  
    reportData.forEach((report, index) => {
      const reportItem = createReportItem(report, index);
      reportContainer.appendChild(reportItem);
    });
  
    function createReportItem(report, index) {
      const reportItem = document.createElement('div');
      reportItem.className = 'report-item';
  
      const reportHeader = document.createElement('div');
      reportHeader.className = 'report-header';
      reportHeader.textContent = `Report ${index + 1}`;
      reportHeader.addEventListener('click', () => toggleDropdown(reportDropdown));
  
      const reportDropdown = document.createElement('div');
      reportDropdown.className = 'report-dropdown';
  
      report.urls.forEach((url, urlIndex) => {
        const button = createDownloadButton(url, urlIndex);
        reportDropdown.appendChild(button);
      });
  
      reportItem.appendChild(reportHeader);
      reportItem.appendChild(reportDropdown);
  
      return reportItem;
    }
  
    function createDownloadButton(url, index) {
      const button = document.createElement('button');
      button.textContent = `Download File ${index + 1}`;
      button.className = 'download-button';
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        downloadReport(url);
      });
      return button;
    }
  
    async function downloadReport(url) {
      try {
        showLoadingOverlay();
  
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to download report');
        }
  
        const blob = await response.blob();
        const tempUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = tempUrl;
        a.download = url.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(tempUrl);
      } catch (error) {
        console.error('Error downloading report:', error);
        alert('Failed to download report');
      } finally {
        hideLoadingOverlay();
      }
    }
  
    function toggleDropdown(dropdown) {
      dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'block' : 'none';
    }
  
    function showLoadingOverlay() {
      loadingOverlay.style.display = 'flex';
    }
  
    function hideLoadingOverlay() {
      loadingOverlay.style.display = 'none';
    }
  });
  