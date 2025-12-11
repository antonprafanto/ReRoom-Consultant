
import { RoomAnalysis, BudgetEstimate } from '../types';

interface ReportData {
  originalImage: string;
  generatedImage: string;
  selectedStyle: string;
  palette: string[];
  analysis: RoomAnalysis | null;
  budget: BudgetEstimate | null;
}

export const generatePDFReport = (data: ReportData) => {
  const { originalImage, generatedImage, selectedStyle, palette, analysis, budget } = data;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to generate the report.");
    return;
  }

  const date = new Date().toLocaleDateString();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ReRoom Design Report - ${selectedStyle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          color: #111827;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }

        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }

        header {
          border-bottom: 2px solid #4F46E5;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        h1 { margin: 0; color: #4F46E5; font-size: 24px; }
        .subtitle { color: #6B7280; font-size: 14px; margin-top: 4px; }
        .meta { text-align: right; font-size: 12px; color: #9CA3AF; }

        .section { margin-bottom: 40px; }
        .section-title { 
          font-size: 18px; 
          font-weight: 700; 
          margin-bottom: 16px; 
          border-left: 4px solid #4F46E5; 
          padding-left: 12px;
          background: #F9FAFB;
          padding-top: 8px;
          padding-bottom: 8px;
        }

        /* Images */
        .comparison { display: flex; gap: 20px; margin-bottom: 10px; }
        .img-box { flex: 1; }
        .img-box img { width: 100%; height: 250px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; }
        .img-label { font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 4px; display: block; }

        /* Palette */
        .palette { display: flex; gap: 12px; }
        .swatch-container { text-align: center; }
        .swatch { 
          width: 60px; height: 60px; 
          border-radius: 50%; 
          border: 4px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
          margin-bottom: 4px;
        }
        .hex { font-family: monospace; font-size: 10px; color: #6B7280; }

        /* Analysis */
        .scores { display: flex; gap: 20px; margin-bottom: 20px; }
        .score-card { 
          flex: 1; 
          background: #F3F4F6; 
          padding: 15px; 
          border-radius: 8px; 
          text-align: center; 
        }
        .score-val { font-size: 24px; font-weight: 700; color: #4F46E5; }
        .score-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6B7280; }

        .lists { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .list-box h4 { margin: 0 0 10px 0; font-size: 14px; }
        .pros h4 { color: #059669; }
        .cons h4 { color: #DC2626; }
        ul { margin: 0; padding-left: 20px; font-size: 13px; }
        li { margin-bottom: 4px; }

        .tips { background: #FFFBEB; padding: 15px; border-radius: 8px; border: 1px solid #FCD34D; }
        .tips h4 { margin: 0 0 10px 0; color: #B45309; font-size: 14px; }

        /* Budget */
        .budget-total { font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 10px; }
        .budget-item { 
          display: flex; 
          justify-content: space-between; 
          border-bottom: 1px solid #E5E7EB; 
          padding: 8px 0; 
          font-size: 13px;
        }
        .budget-item:last-child { border-bottom: none; }
        .disclaimer { font-size: 10px; font-style: italic; color: #9CA3AF; margin-top: 10px; }

        footer {
          margin-top: 50px;
          border-top: 1px solid #E5E7EB;
          padding-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #9CA3AF;
        }
      </style>
    </head>
    <body>
      <header>
        <div>
          <h1>ReRoom Consultant</h1>
          <div class="subtitle">Design Transformation Report</div>
        </div>
        <div class="meta">
          <div>Date: ${date}</div>
          <div>Style: ${selectedStyle}</div>
        </div>
      </header>

      <!-- Section 1: Visuals -->
      <div class="section">
        <div class="section-title">Visual Transformation</div>
        <div class="comparison">
          <div class="img-box">
            <span class="img-label">ORIGINAL SPACE</span>
            <img src="${originalImage}" />
          </div>
          <div class="img-box">
            <span class="img-label">REIMAGINED (${selectedStyle.toUpperCase()})</span>
            <img src="${generatedImage}" />
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <span class="img-label" style="margin-bottom: 8px;">COLOR PALETTE</span>
          <div class="palette">
            ${palette.map(color => `
              <div class="swatch-container">
                <div class="swatch" style="background-color: ${color};"></div>
                <div class="hex">${color}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Section 2: Analysis -->
      ${analysis ? `
      <div class="section">
        <div class="section-title">Room Analysis</div>
        <div class="scores">
          <div class="score-card">
            <div class="score-val">${analysis.lightingScore}/10</div>
            <div class="score-label">Lighting</div>
          </div>
          <div class="score-card">
            <div class="score-val">${analysis.layoutScore}/10</div>
            <div class="score-label">Layout</div>
          </div>
          <div class="score-card">
            <div class="score-val">${analysis.colorHarmonyScore}/10</div>
            <div class="score-label">Color Harmony</div>
          </div>
        </div>
        <div class="lists">
          <div class="list-box pros">
            <h4>WHAT WORKS</h4>
            <ul>
              ${analysis.pros.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          <div class="list-box cons">
            <h4>TO IMPROVE</h4>
            <ul>
              ${analysis.cons.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="tips" style="margin-top: 20px;">
          <h4>QUICK WINS</h4>
          <ul>
            ${analysis.quickTips.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      <!-- Section 3: Budget -->
      ${budget ? `
      <div class="page-break"></div> <!-- Force new page if budget exists -->
      <div class="section">
        <div class="section-title">Renovation Estimate</div>
        <div class="budget-total">
          Est. Total: ${budget.currency}${budget.totalCostLow.toLocaleString()} - ${budget.currency}${budget.totalCostHigh.toLocaleString()}
        </div>
        
        <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px;">
          ${budget.categories.map(cat => `
            <div class="budget-item">
              <div>
                <strong>${cat.categoryName}</strong><br/>
                <span style="color: #6B7280; font-size: 11px;">${cat.items.join(', ')}</span>
              </div>
              <div>${budget.currency}${cat.estimatedCostLow} - ${cat.estimatedCostHigh}</div>
            </div>
          `).join('')}
        </div>
        <div class="disclaimer">
          * ${budget.disclaimer} This is an AI-generated estimate for planning purposes only.
        </div>
      </div>
      ` : ''}

      <footer>
        Generated by ReRoom Consultant • Created by Anton Prafanto in Samarinda
      </footer>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
