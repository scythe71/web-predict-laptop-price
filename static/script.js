document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('predict-form');
    const brandSelect = document.getElementById('processor_brand');
    const tierSelect = document.getElementById('processor_tier');
    const resultBox = document.getElementById('result');

    const allTierOptions = Array.from(tierSelect.options).map(option => ({
        value: option.value,
        text: option.text
    }));

    function filterTiers() {
        const brand = brandSelect.value.toLowerCase();

        const filteredOptions = allTierOptions.filter(option => {
            const value = option.value.toLowerCase();

            if (brand === 'amd') {
                return value.startsWith('ryzen');
            }

            if (brand === 'intel') {
                return value.startsWith('core');
            }

            return true;
        });

        tierSelect.innerHTML = '';

        filteredOptions.forEach(option => {
            tierSelect.add(new Option(option.text, option.value));
        });
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

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Prediction failed');
            }

            const price = Number(result.predicted_price).toLocaleString('id-ID');

            resultBox.innerText = `Predicted Price: Rp ${price}`;

            Swal.fire({
                title: 'Prediction Result',
                html: `
                    <p><strong>Predicted Price:</strong> Rp ${price}</p>
                    <p><strong>MSE:</strong> ${result.mse}</p>
                    <p><strong>MAE:</strong> ${result.mae}</p>
                    <p><strong>R²:</strong> ${result.r2}</p>
                `,
                icon: 'info'
            });
        } catch (error) {
            resultBox.innerText = 'Prediction failed. Check your input.';

            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error'
            });
        }
    });
});
