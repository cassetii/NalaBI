// ================================================
// MATERIAL TRACKER WITH CHART.JS
// Nala Project Management System
// ================================================

let deviationChart = null;

// Initialize material tracking chart
function initMaterialChart(materials, services) {
    const ctx = document.getElementById('deviationChart');
    
    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }
    
    // Destroy existing chart
    if (deviationChart) {
        deviationChart.destroy();
    }
    
    // Combine materials and services
    const allItems = [...materials, ...services];
    
    // Prepare data
    const labels = allItems.map(item => item.name);
    const quotationData = allItems.map(item => 
        (item.quotationPrice || 0) * (item.quotationQty || 0)
    );
    const realData = allItems.map(item => 
        (item.realPrice || 0) * (item.realQty || 0)
    );
    
    // Calculate deviation percentages
    const deviationData = allItems.map((item, index) => {
        const quotation = quotationData[index];
        const real = realData[index];
        
        if (quotation === 0) return 0;
        
        return ((real - quotation) / quotation) * 100;
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
                    label: 'Deviasi (%)',
                    data: deviationData,
                    type: 'line',
                    borderColor: 'rgba(244, 67, 54, 1)',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(244, 67, 54, 1)',
                    yAxisID: 'y1',
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
                    text: 'Perbandingan Penawaran vs Real Material & Jasa',
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
                            
                            if (context.dataset.yAxisID === 'y1') {
                                // Deviation percentage
                                label += context.parsed.y.toFixed(2) + '%';
                            } else {
                                // Currency
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
                        text: 'Total Biaya (IDR)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + (value / 1000000).toFixed(1) + 'jt';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Deviasi (%)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(0) + '%';
                        }
                    }
                }
            }
        }
    });
    
    console.log('📊 Material deviation chart initialized');
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
        const deviation = quotationTotal > 0 
            ? ((realTotal - quotationTotal) / quotationTotal * 100).toFixed(1)
            : 0;
        
        // Deviation color
        let deviationColor = '#4CAF50'; // green (under budget)
        if (deviation > 0) deviationColor = '#F44336'; // red (over budget)
        if (deviation === 0) deviationColor = '#757575'; // grey (exact)
        
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
                <strong style="color: ${deviationColor}">
                    ${deviation}%
                    ${deviation > 0 ? '↑' : deviation < 0 ? '↓' : ''}
                </strong>
                <div style="font-size: 11px; color: #999;">
                    ${utils.formatCurrency(realTotal - quotationTotal)}
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
    // This will be handled by the save button
    // Just mark as dirty for now
    input.style.borderColor = '#FF9800'; // Orange to indicate unsaved changes
}

// Calculate material summary
function calculateMaterialSummary(materials, services) {
    const allItems = [...materials, ...services];
    
    let totalQuotation = 0;
    let totalReal = 0;
    
    allItems.forEach(item => {
        totalQuotation += (item.quotationPrice || 0) * (item.quotationQty || 0);
        totalReal += (item.realPrice || 0) * (item.realQty || 0);
    });
    
    const totalDeviation = totalQuotation > 0 
        ? ((totalReal - totalQuotation) / totalQuotation * 100).toFixed(2)
        : 0;
    
    return {
        totalQuotation,
        totalReal,
        totalDeviation,
        difference: totalReal - totalQuotation
    };
}

// Export functions
window.initMaterialChart = initMaterialChart;
window.renderMaterialTable = renderMaterialTable;
window.calculateMaterialSummary = calculateMaterialSummary;
window.updateMaterialData = updateMaterialData;
