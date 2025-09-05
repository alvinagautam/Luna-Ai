document.addEventListener('DOMContentLoaded', () => 
{
    const themeToggle = document.getElementById('theme-toggle');
    const historyToggle = document.getElementById('history-toggle');
    const historySidebar = document.getElementById('history-sidebar');
    const appWrapper = document.getElementById('app-wrapper');
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const imageContainer = document.getElementById('image-container');
    const generatedImage = document.getElementById('generated-image');
    const placeholderText = document.getElementById('placeholder-text');
    const loader = document.getElementById('loader');
    const historyGrid = document.getElementById('history-grid');

    const API_KEY = "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";
    const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

    let imageHistory = [];

    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    themeToggle.querySelector('.material-symbols-outlined').textContent = currentTheme === 'light' ? 'dark_mode' : 'light_mode';

    themeToggle.addEventListener('click', () => 
    {
        let newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.querySelector('.material-symbols-outlined').textContent = newTheme === 'light' ? 'dark_mode' : 'light_mode';
    });
    
    historyToggle.addEventListener('click', () => 
    {
        historySidebar.classList.toggle('show');
        appWrapper.classList.toggle('shifted');
    });

    const showLoading = (isLoading) =>
    {
        loader.style.display = isLoading ? 'block' : 'none';
        generateBtn.disabled = isLoading;
        if (isLoading) {
            generatedImage.style.display = 'none';
            placeholderText.style.display = 'none';
        }
    };

    const updateImageDisplay = (imageUrl, prompt) => 
    {
        generatedImage.src = imageUrl;
        generatedImage.alt = prompt;
        generatedImage.style.display = 'block';
        placeholderText.style.display = 'none';
    };

    const addToHistory = (imageUrl, prompt) => 
    {
        imageHistory.unshift({ src: imageUrl, prompt });
        
        if (imageHistory.length > 20) {
            imageHistory.pop();
        }

        renderHistory();
    };

    const renderHistory = () => 
    {
        historyGrid.innerHTML = '';
        imageHistory.forEach(item => {
            const imgElement = document.createElement('img');
            imgElement.src = item.src;
            imgElement.alt = item.prompt;
            imgElement.title = `Click to view\nPrompt: "${item.prompt}"`;
            imgElement.addEventListener('click', () => {
                updateImageDisplay(item.src, item.prompt);
                if (window.innerWidth <= 768) {
                    historySidebar.classList.remove('show');
                    appWrapper.classList.remove('shifted');
                }
            });
            historyGrid.appendChild(imgElement);
        });
    };

    const generateImage = async () => 
    {
        const prompt = promptInput.value.trim();
        if (!prompt) 
        {
            alert('Please enter a prompt!');
            return;
        }

        if (!API_KEY.startsWith("hf_")) 
        {
            alert('Please enter a valid Hugging Face API Key in script.js');
            return;
        }

        showLoading(true);
        
        try 
        {
            const response = await fetch(API_URL, 
            {
                method: 'POST',
                headers: 
                {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: prompt }),
            });

            if (!response.ok) 
            {
                const errorBody = await response.text();
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            updateImageDisplay(imageUrl, prompt);
            addToHistory(imageUrl, prompt);

        }
        catch (error) 
        {
            console.error(error);
            placeholderText.textContent = `Sorry, something went wrong. Please try again. (${error.message})`;
            placeholderText.style.display = 'block';
        }
        finally 
        {
            showLoading(false);
        }
    };

    generateBtn.addEventListener('click', generateImage);
    promptInput.addEventListener('keyup', (event) => 
    {
        if (event.key === 'Enter' && !event.shiftKey) 
        {
            generateImage();
        }
    });
});
