document.addEventListener('DOMContentLoaded', function() {
    initSalesChart();
    initSidebarToggle();
    initLogout();
    loadTopCategories();
});

let salesChart = null;

async function loadTopCategories() {
    try {
        const response = await fetch('/admin/dashboard/top-categories');
        const categories = await response.json();
        
        if (!categories || categories.length === 0) {
            document.getElementById('top-categories-container').innerHTML = `
                <div class="no-data">No category data available</div>
            `;
            return;
        }
        
        const container = document.getElementById('top-categories-container');
        container.innerHTML = categories.map(category => `
            <div class="category-card">
                <div class="category-header">
                    <h3>${category.name}</h3>
                    <span class="sales-value">₹${(category.totalSales || 0).toLocaleString()}</span>
                </div>
                <div class="progress-bar">
                    <div class="fill" style="width: ${category.percentage || 0}%"></div>
                </div>
                <div class="subcategories">
                    ${(category.subcategories || []).map(sub => `
                        <div class="subcategory">
                            <div class="sub-header">
                                <span>${sub.name}</span>
                                <span class="sub-sales">₹${(sub.sales || 0).toLocaleString()}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="fill" style="width: ${sub.percentage || 0}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading top categories:', error);
        document.getElementById('top-categories-container').innerHTML = `
            <div class="error-message">Error loading categories</div>
        `;
    }
}

async function initSalesChart() {
    const timeframeSelect = document.getElementById('timeframe-select');
    
    async function updateChart() {
        try {
            const response = await fetch(`/admin/dashboard/sales-chart?timeframe=${timeframeSelect.value}`);
            const chartData = await response.json();

            const ctx = document.getElementById('salesChart').getContext('2d');
            
            if (salesChart) {
                salesChart.destroy();
            }
            
            salesChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.map(d => d.label),
                    datasets: [{
                        label: 'Sales (₹)',
                        data: chartData.map(d => d.value),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            labels: { color: '#f3f4f6' }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: '#1f2937',
                            titleColor: '#f3f4f6',
                            bodyColor: '#f3f4f6',
                            borderColor: '#374151',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    return '₹' + context.raw.toLocaleString();
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#374151' },
                            ticks: {
                                color: '#f3f4f6',
                                callback: value => '₹' + value.toLocaleString()
                            }
                        },
                        x: {
                            grid: { color: '#374151' },
                            ticks: { color: '#f3f4f6' }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        } catch (error) {
            console.error('Error updating sales chart:', error);
        }
    }

    timeframeSelect.addEventListener('change', updateChart);
    updateChart();
}

function initSidebarToggle() {
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        container.classList.toggle('sidebar-hidden');
    });

    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && 
            !toggleBtn.contains(e.target) && 
            window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            container.classList.remove('sidebar-hidden');
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            container.classList.remove('sidebar-hidden');
        }
    });
}

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/admin/dashboard/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            });

            const data = await response.json();
            
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                throw new Error(data.message || 'Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout. Please try again.');
        }
    });
}