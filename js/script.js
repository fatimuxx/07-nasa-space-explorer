// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const fetchButton = document.querySelector('.filters button');

// Get modal elements
const modal = document.getElementById('imageModal');
const closeBtn = document.querySelector('.close-btn');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Store image results so we can access them when modal is opened
let currentImages = [];

// Your NASA API key
const nasaApiKey = 'tTeLNzNXphJ3ZMlYGtuyTlaYJZFDPVP29gbfKbUT';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

fetchButton.addEventListener('click', () => {
  const startDate = startInput.value;
  const endDate = endInput.value;
  fetchSpaceImages(startDate, endDate);
});

// Close modal when user clicks the close button
closeBtn.addEventListener('click', closeModal);

// Close modal when user clicks outside the modal content
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Open modal and populate with image data using the index
function openModal(index) {
  const imageData = currentImages[index];
  if (imageData) {
    modalImage.src = imageData.url;
    modalImage.alt = imageData.title;
    modalTitle.textContent = imageData.title;
    modalDate.textContent = imageData.date;
    modalExplanation.textContent = imageData.explanation;
    modal.classList.add('open');
  }
}

// Close the modal
function closeModal() {
  modal.classList.remove('open');
}

function fetchSpaceImages(startDate, endDate) {
  if (!startDate || !endDate) {
    gallery.innerHTML = '<p>Please choose both a start date and an end date.</p>';
    return;
  }

  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&start_date=${startDate}&end_date=${endDate}`;

  gallery.innerHTML = '<p>Loading space images...</p>';

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`HTTP ${response.status}: ${text}`);
        });
      }
      return response.text().then((text) => {
        try {
          return JSON.parse(text);
        } catch (error) {
          throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
        }
      });
    })
    .then((data) => {
      if (data.error) {
        throw new Error(data.error.message);
      }

      const results = Array.isArray(data) ? data : [data];
      const imageResults = results.filter((item) => item.media_type === 'image');

      if (imageResults.length === 0) {
        gallery.innerHTML = '<p>No image results found for that date range.</p>';
        return;
      }

      // Store the images for modal access
      currentImages = imageResults;

      gallery.innerHTML = imageResults
        .map(
          (item, index) => `
            <div class="gallery-item">
              <img src="${item.url}" alt="${item.title}" onclick="openModal(${index})" />
              <p><strong>${item.title}</strong></p>
              <p>${item.date}</p>
            </div>
          `
        )
        .join('');
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      gallery.innerHTML = `<p>Unable to load images. ${error.message}</p>`;
    });
}
