document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('predict-form');
    const brandSelect = document.getElementById('processor_brand');
    const tierSelect = document.getElementById('processor_tier');
    const resultBox = document.getElementById('result');
    const btn = document.getElementById('predict-btn');

    const allTierOptions = [
        { value: 'core i3', text: 'Core i3' },
        { value: 'core i5', text: 'Core i5' },
        { value: 'core i7', text: 'Core i7' },
        { value: 'ryzen 3', text: 'Ryzen 3' },
        { value: 'ryzen 5', text: 'Ryzen 5' },
        { value: 'ryzen 7', text: 'Ryzen 7' }
    ];

    function filterTiers() {
        const brand = brandSelect.value;

        const filtered = allTierOptions.filter(opt => {
            if (brand === 'amd') return opt.value.startsWith('ryzen');
            return opt.value.startsWith('core');
        });

        tierSelect.innerHTML = '';
        filtered.forEach(opt => tierSelect.add(new Option(opt.text, opt.value)));
    }

    brandSelect.addEventListener('change', filterTiers);
    filterTiers();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            processor_brand: brandSelect.value,
            processor_tier: tierSelect.value,
            num_cores: document.getElementById('num_cores').value,
            num_threads: document.getElementById('num_threads').value,
            ram_memory: document.getElementById('ram_memory').value,
            storage: document.getElementById('storage').value,
            gpu_type: document.getElementById('gpu_type').value,
            display_size: document.getElementById('display_size').value
        };

        btn.disabled = true;
        btn.textContent = 'Memproses...';
        resultBox.textContent = '';
        resultBox.classList.remove('has-value');

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Prediksi gagal');
            }

            const price = Number(result.predicted_price).toLocaleString('id-ID');

            resultBox.textContent = `Rp ${price}`;
            resultBox.classList.add('has-value');

            Swal.fire({
                title: 'Hasil Prediksi',
                html: `
                    <div style="text-align:left; font-size:14px; line-height:1.8;">
                        <p style="text-align:center; font-size:20px; font-weight:700; color:#2563eb; margin-bottom:12px;">
                            Rp ${price}
                        </p>
                        <hr style="border:none; border-top:1px solid #e5e7eb; margin:10px 0;">
                        <p style="font-size:12px; color:#9ca3af;">Performa Model</p>
                        <p><strong>R² Score:</strong> ${result.r2} — seberapa baik model menjelaskan variasi harga</p>
                        <p><strong>MAE:</strong> Rp ${Number(result.mae).toLocaleString('id-ID')} — rata-rata kesalahan prediksi</p>
                        <p><strong>MSE:</strong> Rp ${Number(result.mse).toLocaleString('id-ID')} — kesalahan kuadrat rata-rata</p>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Tutup'
            });
        } catch (error) {
            resultBox.textContent = 'Prediksi gagal. Periksa input.';
            resultBox.classList.remove('has-value');

            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Tutup'
            });
        } finally {
            btn.disabled = false;
            btn.textContent = 'Prediksi Harga';
        }
    });
});
