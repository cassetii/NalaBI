// ================================================
// MATERIAL TRACKER WITH CHART.JS - UPDATED
// Formula: PROFIT/LOSS = PENAWARAN - REAL
// ================================================

let deviationChart = null;

// Initialize material tracking chart
function initMaterialChart(materials, services, acUnits = []) {
    const ctx = document.getElementById('deviationChart');
    
    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }
    
    // Destroy existing chart
    if (deviationChart) {
        deviationChart.destroy();
    }
    
    // Combine materials, services, and AC units
    const allItems = [...materials, ...services, ...acUnits];
    
    // Prepare data
    const labels = allItems.map(item => item.name || item.acType);
    const quotationData = allItems.map(item => 
        (item.quotationPrice || 0) * (item.quotationQty || 0)
    );
    const realData = allItems.map(item => 
        (item.realPrice || 0) * (item.realQty || 0)
    );
    
    // Calculate PROFIT/LOSS (Penawaran - Real)
    const profitLossData = allItems.map((item, index) => {
        const quotation = quotationData[index];
        const real = realData[index];
        return quotation - real;
    });
    
    // Chart configuration
    deviationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Penawaran (IDR)',
                    data: quotationData,
                    backgroundColor: 'rgba(33, 150, 243, 0.8)',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Total Real (IDR)',
                    data: realData,
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Profit/Loss (IDR)',
                    data: profitLossData,
                    type: 'line',
                    borderColor: 'rgba(244, 67, 54, 1)',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: function(context) {
                        const value = context.raw;
                        return value >= 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)';
                    },
                    yAxisID: 'y',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Perbandingan Penawaran vs Real Material, Jasa & Unit AC',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            
                            if (label) {
                                label += ': ';
                            }
                            
                            if (context.dataset.label === 'Profit/Loss (IDR)') {
                                const value = context.parsed.y;
                                if (value >= 0) {
                                    label += 'PROFIT ' + utils.formatCurrency(value);
                                } else {
                                    label += 'LOSS ' + utils.formatCurrency(Math.abs(value));
                                }
                            } else {
                                label += utils.formatCurrency(context.parsed.y);
                            }
                            
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Total (IDR)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return 'Rp ' + (value / 1000000).toFixed(1) + 'jt';
                            } else if (value >= 1000) {
                                return 'Rp ' + (value / 1000).toFixed(0) + 'rb';
                            }
                            return 'Rp ' + value;
                        }
                    }
                }
            }
        }
    });
    
    console.log('📊 Material chart initialized with profit/loss');
}

// Render material table rows
function renderMaterialTable(materials, tableBodyId) {
    const tbody = document.getElementById(tableBodyId);
    
    if (!tbody) {
        console.error('Table body not found:', tableBodyId);
        return;
    }
    
    tbody.innerHTML = '';
    
    materials.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Calculate totals
        const quotationTotal = (item.quotationPrice || 0) * (item.quotationQty || 0);
        const realTotal = (item.realPrice || 0) * (item.realQty || 0);
        const profitLoss = quotationTotal - realTotal;
        
        // Color based on profit/loss
        let profitLossColor = '#4CAF50';
        let profitLossText = 'PROFIT';
        let profitLossIcon = '↑';
        
        if (profitLoss < 0) {
            profitLossColor = '#F44336';
            profitLossText = 'LOSS';
            profitLossIcon = '↓';
        } else if (profitLoss === 0) {
            profitLossColor = '#757575';
            profitLossText = 'BREAK EVEN';
            profitLossIcon = '=';
        }
        
        row.innerHTML = `
            <td><strong>${item.name}</strong></td>
            <td>${item.unit}</td>
            <td>
                <input type="number" 
                       class="material-input" 
                       data-index="${index}" 
                       data-field="quotationQty" 
                       value="${item.quotationQty || 0}" 
                       min="0" 
                       step="any">
            </td>
            <td>
                <input type="number" 
                       class="material-input" 
                       data-index="${index}" 
                       data-field="quotationPrice" 
                       value="${item.quotationPrice || 0}" 
                       min="0" 
                       step="any"
                       placeholder="Harga satuan">
            </td>
            <td>
                <input type="number" 
                       class="material-input" 
                       data-index="${index}" 
                       data-field="realQty" 
                       value="${item.realQty || 0}" 
                       min="0" 
                       step="any">
            </td>
            <td>
                <input type="number" 
                       class="material-input" 
                       data-index="${index}" 
                       data-field="realPrice" 
                       value="${item.realPrice || 0}" 
                       min="0" 
                       step="any"
                       placeholder="Harga satuan">
            </td>
            <td>
                <strong style="color: ${profitLossColor}">
                    ${profitLossText} ${profitLossIcon}
                </strong>
                <div style="font-size: 13px; font-weight: 600; color: ${profitLossColor};">
                    ${utils.formatCurrency(Math.abs(profitLoss))}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to inputs
    tbody.querySelectorAll('.material-input').forEach(input => {
        input.addEventListener('change', () => {
            updateMaterialData(input);
        });
    });
}

// Update material data on input change
function updateMaterialData(input) {
    input.style.borderColor = '#FF9800';
}

// Calculate material summary
function calculateProjectSummary(materials, services, acUnits = []) {
    const allItems = [...materials, ...services, ...acUnits];
    
    let totalQuotation = 0;
    let totalReal = 0;
    
    allItems.forEach(item => {
        totalQuotation += (item.quotationPrice || 0) * (item.quotationQty || 0);
        totalReal += (item.realPrice || 0) * (item.realQty || 0);
    });
    
    const profitLoss = totalQuotation - totalReal;
    
    return {
        totalQuotation,
        totalReal,
        profitLoss,
        isProfitable: profitLoss >= 0
    };
}

// Export functions
window.initMaterialChart = initMaterialChart;
window.renderMaterialTable = renderMaterialTable;
window.calculateProjectSummary = calculateProjectSummary;
window.updateMaterialData = updateMaterialData;
