class SalesReport {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
        this.downloadModal = document.getElementById('downloadModal');
        this.initializeDownloadModal();
    }

    initializeElements() {
        this.startDate = document.getElementById('start-date');
        this.endDate = document.getElementById('end-date');
        this.applyDateBtn = document.querySelector('.apply-date-btn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.salesTableBody = document.getElementById('salesTableBody');
        this.periodBtns = document.querySelectorAll('[data-period]');
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'loading-overlay';
    }

    attachEventListeners() {
        this.applyDateBtn.addEventListener('click', () => this.loadSalesData());
        this.downloadBtn.addEventListener('click', () => this.showDownloadModal());
        this.periodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePeriodFilter(e));
        });
        
        document.querySelector('.table-container').addEventListener('click', (e) => {
            const expandBtn = e.target.closest('.expand-btn');
            if (expandBtn) this.handleRowExpand(expandBtn);
        });
    }

    async loadInitialData() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        this.startDate.value = this.formatDate(firstDayOfMonth);
        this.endDate.value = this.formatDate(today);
        
        await this.loadSalesData();
    }

    showLoading() {
        document.body.appendChild(this.loadingOverlay);
        document.body.classList.add('loading');
    }

    hideLoading() {
        document.body.removeChild(this.loadingOverlay);
        document.body.classList.remove('loading');
    }

    async loadSalesData() {
        try {
            this.showLoading();
            const params = new URLSearchParams({
                startDate: this.startDate.value,
                endDate: this.endDate.value
            });

            const response = await fetch(`/admin/sales/report?${params}`);
            if (!response.ok) throw new Error('Failed to fetch sales data');
            
            const data = await response.json();
            this.renderTable(data.products);
            this.updateStats(data.stats);
        } catch (error) {
            console.error('Error loading sales data:', error);
            this.showError('Failed to load sales data. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    renderTable(products) {
        this.salesTableBody.innerHTML = '';
        products.forEach(product => {
            const row = this.createProductRow(product);
            this.salesTableBody.appendChild(row);

            if (product.variants?.length) {
                product.variants.forEach(variant => {
                    const variantRow = this.createVariantRow(variant, product.productId);
                    this.salesTableBody.appendChild(variantRow);
                });
            }
        });
    }

    createProductRow(product) {
        const tr = document.createElement('tr');
        tr.className = 'product-row';
        tr.dataset.productId = product.productId;

        tr.innerHTML = `
            <td>
                <button class="expand-btn">
                    <i class="fas fa-chevron-right"></i>
                </button>
                ${product.productId}
            </td>
            <td>
                <img src="${product.image}" alt="${product.name}" class="product-img">
            </td>
            <td>${product.name}</td>
            <td class="text-right">${product.totalQuantity}</td>
            <td class="text-right">₹${product.totalAmount.toLocaleString()}</td>
        `;

        return tr;
    }

    createVariantRow(variant, productId) {
        const tr = document.createElement('tr');
        tr.className = 'variant-row';
        tr.dataset.parentId = productId;

        tr.innerHTML = `
            <td></td>
            <td><img src="${variant.image}" alt="${variant.color}" class="variant-img"></td>
            <td>${variant.color}</td>
            <td class="text-right">${variant.quantitySold}</td>
            <td class="text-right">₹${variant.revenue.toLocaleString()}</td>
        `;

        return tr;
    }

    handleRowExpand(expandBtn) {
        const productRow = expandBtn.closest('.product-row');
        const productId = productRow.dataset.productId;
        const icon = expandBtn.querySelector('i');
        const variantRows = document.querySelectorAll(`tr[data-parent-id="${productId}"]`);

        icon.classList.toggle('fa-chevron-right');
        icon.classList.toggle('fa-chevron-down');

        variantRows.forEach(row => {
            row.classList.toggle('expanded');
        });
    }

    async handlePeriodFilter(e) {
        const period = e.target.dataset.period;
        const dates = this.calculatePeriodDates(period);
        
        this.startDate.value = this.formatDate(dates.start);
        this.endDate.value = this.formatDate(dates.end);
        
        await this.loadSalesData();
    }

    calculatePeriodDates(period) {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (period) {
            case 'daily':
                start = today;
                break;
            case 'monthly':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'yearly':
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
                break;
        }

        return { start, end };
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    updateStats(stats) {
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalSales').textContent = `₹${stats.totalSales.toLocaleString()}`;
        document.getElementById('totalUnits').textContent = stats.totalUnits;
    }

    showDownloadModal() {
        this.downloadModal.classList.add('active');
    }

    initializeDownloadModal() {
        // Only show the modal when clicking download button
        this.downloadBtn.addEventListener('click', () => {
            this.showDownloadModal();
        });

        // Close modal when clicking outside
        this.downloadModal.addEventListener('click', (e) => {
            if (e.target === this.downloadModal) {
                this.downloadModal.classList.remove('active');
            }
        });

        // Handle format selection and download
        const formatButtons = this.downloadModal.querySelectorAll('[data-format]');
        formatButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const format = e.target.closest('[data-format]').dataset.format;
                await this.downloadReport(format);
                this.downloadModal.classList.remove('active');
            });
        });
    }

    async downloadReport(format) {
        try {
            this.showLoading();
            const params = new URLSearchParams({
                startDate: this.startDate.value,
                endDate: this.endDate.value,
                format: format
            });

            const response = await fetch(`/admin/sales/download?${params}`);
            if (!response.ok) throw new Error('Failed to download report');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sales-report-${this.formatDate(new Date())}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading report:', error);
            this.showError('Failed to download report. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    showError(message) {
        alert(message);
    }
}

// Initialize the sales report when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SalesReport();
});