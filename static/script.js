document.getElementById('predict-form')
.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        processor_brand: document.getElementById('processor_brand').value,
        processor_tier: document.getElementById('processor_tier').value,
        num_cores: document.getElementById('num_cores').value,
        num_threads: document.getElementById('num_threads').value,
        ram_memory: document.getElementById('ram_memory').value,
        storage: document.getElementById('storage').value,
        gpu_type: document.getElementById('gpu_type').value,
        display_size: document.getElementById('display_size').value
    };
    const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    const resultEl = document.getElementById('result');
    resultEl.classList.remove('show');
    // Animate out, then in
    setTimeout(() => {
        resultEl.innerText = `Predicted Price: Rp ${Number(result.predicted_price).toLocaleString('id-ID')}`;
        resultEl.classList.add('show');
    }, 120);
});
