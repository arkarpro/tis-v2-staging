const CONTENT_DB_URL = "https://script.google.com/macros/s/AKfycbyPPCYnpCs4FuIlnmOP-Xfldqjq3NCr9wdEio96mtyg9Y0EuisM8Q6J9H9Gl1IJ1XGrqg/exec";

async function fetchArticles() {
    const container = document.getElementById('content-container');
    
    // Default loader
    container.innerHTML = '<div class="col-span-full text-center">Loading modules...</div>';

    try {
        const response = await fetch(CONTENT_DB_URL);
        const data = await response.json();

        if (data && data.length > 0) {
            // Layout styling for grid
            container.className = "grid grid-cols-1 md:grid-cols-2 gap-6";
            
            container.innerHTML = data.map(item => {
                // Extract video ID for thumbnail
                let videoId = '';
                if (item.Media_URL.includes('youtu.be/')) {
                    videoId = item.Media_URL.split('/').pop();
                } else if (item.Media_URL.includes('v=')) {
                    videoId = item.Media_URL.split('v=')[1].split('&')[0];
                }

                const isPremium = String(item.Is_Premium).toUpperCase() === 'TRUE';

                return `
                <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div class="aspect-video bg-gray-200">
                        <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Video Thumbnail" class="w-full h-full object-cover">
                    </div>
                    <div class="p-4">
                        <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">${item.Category}</span>
                        <h3 class="font-bold text-lg mt-1 text-gray-800">${item.Title}</h3>
                        <p class="text-sm text-gray-600 mt-2 line-clamp-2">${item.Description}</p>
                        
                        <div class="mt-4">
                            ${isPremium ? 
                                `<a href="${item.Media_URL}" target="_blank" class="w-full block text-center bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">▶ Watch Video</a>` :
                                `<button onclick="alert('Please login to access this content.')" class="w-full block text-center bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition">🔒 Login to access</button>`
                            }
                        </div>
                    </div>
                </div>`;
            }).join('');
        } else {
            container.innerHTML = '<p class="text-center text-gray-500">No content available.</p>';
        }
    } catch (error) {
        console.error("Fetch error:", error);
        container.innerHTML = '<p class="text-center text-red-500">Failed to load content.</p>';
    }
}