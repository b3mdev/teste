// Global variable for the map
let map;
let infoWindow; // To display info on click, if needed for map markers
let imageOverlay; // To hold the ground overlay object
let currentSVGDoc = null; // To hold the parsed SVG document
let interactiveSVGElements = []; // To store { id, type, element, data }
let currentlyDisplayedSVGElements = []; // Elements that match current filters
let mapClickHandler = null; // To store the map click listener

/**
 * Initializes the Google Map.
 */
function initMap() {
    const mapOptions = {
        center: { lat: -14.235004, lng: -51.92528 }, // Centered on Brazil
        zoom: 4,
        mapTypeId: 'satellite'
    };
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
    infoWindow = new google.maps.InfoWindow();

    // Event listeners for controls
    document.getElementById('image_upload')?.addEventListener('change', handleImageUpload);
    document.getElementById('remove_image_button')?.addEventListener('click', removeImageOverlay);
    document.getElementById('overlay_opacity')?.addEventListener('input', handleOpacityChange);
    document.getElementById('update_bounds_button')?.addEventListener('click', updateOverlayBoundsFromInputs);

    const statusFilterInput = document.getElementById('status_filter');
    if (statusFilterInput) {
        statusFilterInput.addEventListener('change', applyFiltersAndSearch);
    }
    const lotSearchInput = document.getElementById('lot_search');
    if (lotSearchInput) {
        lotSearchInput.addEventListener('input', applyFiltersAndSearch);
    }

    console.log('Google Map initialized and event listeners for controls set up.');
}

/**
 * Displays information about a given lot element in the info panel.
 * @param {object | null} lotElementData The data object of the lot, or null to hide panel.
 */
function displayLotInfo(lotElementData) {
    const infoPanel = document.getElementById('info_panel');
    const lotDetails = document.getElementById('lot_details');

    if (!lotElementData) {
        infoPanel.style.display = 'none';
        infoPanel.removeAttribute('data-current-lot-id');
        return;
    }

    lotDetails.innerHTML = `
        <strong>Lote ID (SVG):</strong> ${lotElementData.id}<br>
        <strong>Número:</strong> ${lotElementData.data.number || 'N/A'}<br>
        <strong>Status:</strong> ${lotElementData.data.status || 'N/A'}<br>
        <strong>Área:</strong> ${lotElementData.data.area || 'N/A'}<br>
        <strong>Valor:</strong> ${lotElementData.data.value || 'N/A'}
    `;
    infoPanel.style.display = 'block';
    infoPanel.dataset.currentLotId = lotElementData.id;
}

/**
 * Applies current status filter and search term to `interactiveSVGElements`
 * and updates `currentlyDisplayedSVGElements`.
 */
function applyFiltersAndSearch() {
    if (interactiveSVGElements.length === 0) {
        currentlyDisplayedSVGElements = [];
        displayLotInfo(null); // Hide info panel
        return;
    }

    const statusFilter = document.getElementById('status_filter').value;
    const searchTerm = document.getElementById('lot_search').value.trim().toLowerCase();

    let filtered = interactiveSVGElements.slice();

    // Apply status filter
    if (statusFilter !== "all") {
        filtered = filtered.filter(el => el.data.status && el.data.status.toLowerCase() === statusFilter);
    }

    // Apply search term filter (on lot number)
    if (searchTerm !== "") {
        filtered = filtered.filter(el => el.data.number && el.data.number.toLowerCase().includes(searchTerm));
    }

    currentlyDisplayedSVGElements = filtered;
    console.log(`Filtering complete. ${currentlyDisplayedSVGElements.length} elements displayed.`);

    // Manage info panel visibility based on filters
    const currentInfoLotId = document.getElementById('info_panel').dataset.currentLotId;
    if (currentInfoLotId) {
        const isStillVisible = currentlyDisplayedSVGElements.some(el => el.id === currentInfoLotId);
        if (!isStillVisible) {
            displayLotInfo(null); // Hide panel if its lot is filtered out
        }
    }

    // If search yields a single result, display it (and it's not already shown)
    if (searchTerm !== "" && currentlyDisplayedSVGElements.length === 1) {
        if (document.getElementById('info_panel').dataset.currentLotId !== currentlyDisplayedSVGElements[0].id) {
            displayLotInfo(currentlyDisplayedSVGElements[0]);
        }
    } else if (searchTerm !== "" && currentlyDisplayedSVGElements.length === 0) {
        displayLotInfo(null); // Hide if search yields no results
    }

    // Reset simulated hit index for map clicks, as the list has changed
    document.getElementById('info_panel').dataset.lastHitIndex = -1;
}


/**
 * Handles changes to the opacity slider.
 */
function handleOpacityChange(event) {
    if (!imageOverlay) return;
    const opacityValue = parseFloat(event.target.value) / 100;
    imageOverlay.setOpacity(opacityValue);
}

/**
 * Populates the LatLngBounds input fields.
 */
function populateBoundsInputs(bounds) {
    if (!bounds) return;
    document.getElementById('sw_lat').value = bounds.getSouthWest().lat().toFixed(6);
    document.getElementById('sw_lng').value = bounds.getSouthWest().lng().toFixed(6);
    document.getElementById('ne_lat').value = bounds.getNorthEast().lat().toFixed(6);
    document.getElementById('ne_lng').value = bounds.getNorthEast().lng().toFixed(6);
}

/**
 * Updates overlay bounds from input fields.
 */
function updateOverlayBoundsFromInputs() {
    if (!imageOverlay) {
        alert('Nenhuma imagem carregada para ajustar.');
        return;
    }
    const swLat = parseFloat(document.getElementById('sw_lat').value);
    const swLng = parseFloat(document.getElementById('sw_lng').value);
    const neLat = parseFloat(document.getElementById('ne_lat').value);
    const neLng = parseFloat(document.getElementById('ne_lng').value);

    if (isNaN(swLat) || isNaN(swLng) || isNaN(neLat) || isNaN(neLng)) {
        alert('Por favor, insira valores numéricos válidos para todas as coordenadas.');
        return;
    }
    try {
        const newBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(swLat, swLng),
            new google.maps.LatLng(neLat, neLng)
        );
        if (newBounds.isEmpty() || newBounds.getSouthWest().lat() >= newBounds.getNorthEast().lat() || newBounds.getSouthWest().lng() >= newBounds.getNorthEast().lng()) {
            alert('Coordenadas inválidas: SW deve ser estritamente ao sul e oeste de NE.');
            return;
        }
        imageOverlay.setBounds(newBounds);
        populateBoundsInputs(imageOverlay.getBounds());
    } catch (error) {
        console.error("Error creating LatLngBounds: ", error);
        alert("Erro ao criar os limites geográficos.");
    }
}

/**
 * Parses SVG for interactive elements.
 */
function parseAndStoreSVGElements(svgDoc) {
    interactiveSVGElements = [];
    if (mapClickHandler) {
        google.maps.event.removeListener(mapClickHandler);
        mapClickHandler = null;
    }

    if (!svgDoc || !svgDoc.documentElement) {
        console.error("SVG document is invalid for parsing.");
        applyFiltersAndSearch(); // Ensure UI reflects no elements
        return;
    }

    const elements = svgDoc.querySelectorAll('path[id], rect[id], circle[id], ellipse[id], polygon[id]');
    elements.forEach(el => {
        if (el.id && el.id.toLowerCase().startsWith('lot_')) {
            interactiveSVGElements.push({
                id: el.id,
                type: el.tagName.toLowerCase(),
                element: el,
                data: {
                    number: el.dataset.lotNumber || el.id.substring(4) || 'N/A',
                    status: el.dataset.status || 'disponivel',
                    area: el.dataset.area || 'N/A',
                    value: el.dataset.value || 'N/A',
                }
            });
        }
    });
    console.log(`Parsed ${interactiveSVGElements.length} interactive SVG elements.`);

    if (interactiveSVGElements.length > 0) {
        mapClickHandler = map.addListener('click', handleMapClickForSVG);
        console.log('Map click listener added/updated for SVG interaction.');
    }
    applyFiltersAndSearch(); // Initialize filtered list and update UI
}

/**
 * Handles map clicks for SVG interaction.
 */
function handleMapClickForSVG(event) {
    if (!imageOverlay || !currentSVGDoc || currentlyDisplayedSVGElements.length === 0) {
        displayLotInfo(null); // Hide info panel
        return;
    }
    console.log('Map clicked at:', event.latLng.toString());

    // SIMULATED HIT DETECTION (cycles through filtered elements)
    let lastHitIndex = parseInt(document.getElementById('info_panel').dataset.lastHitIndex || -1);
    lastHitIndex = (lastHitIndex + 1) % currentlyDisplayedSVGElements.length;
    const hitElement = currentlyDisplayedSVGElements[lastHitIndex];
    document.getElementById('info_panel').dataset.lastHitIndex = lastHitIndex;

    if (hitElement) {
        console.log('Simulated hit on SVG element (from filtered list):', hitElement.id, hitElement.data);
        displayLotInfo(hitElement);
    } else {
        displayLotInfo(null);
    }
}

/**
 * Handles image file upload.
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (currentSVGDoc) { // Clear previous SVG state first
        currentSVGDoc = null;
        parseAndStoreSVGElements(null); // Clears elements, filters, and map click listener
    }
    if (imageOverlay) { // Remove previous overlay before loading new one
        imageOverlay.setMap(null);
        imageOverlay = null;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const fileContent = e.target.result;
        let overlaySourceUrl;
        let svgTextForParsing = null;

        if (file.type === "image/svg+xml") {
            svgTextForParsing = fileContent;
            overlaySourceUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svgTextForParsing);
        } else {
            overlaySourceUrl = fileContent;
        }

        if (svgTextForParsing) {
            const parser = new DOMParser();
            currentSVGDoc = parser.parseFromString(svgTextForParsing, "image/svg+xml");
            if (currentSVGDoc.getElementsByTagName('parsererror').length > 0) {
                alert("Erro ao interpretar o arquivo SVG.");
                console.error("SVG parsing error:", currentSVGDoc.getElementsByTagName('parsererror')[0].innerText);
                currentSVGDoc = null;
            }
        }

        const mapCenter = map.getCenter();
        let offsetLat = 0.01, offsetLng = 0.01;
        if (currentSVGDoc) {
            const svgElement = currentSVGDoc.documentElement;
            const svgWidth = parseFloat(svgElement.getAttribute('width'));
            const svgHeight = parseFloat(svgElement.getAttribute('height'));
            if (svgWidth && svgHeight > 0) {
                offsetLng = offsetLat * (svgWidth / svgHeight);
            }
        }

        const initialBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(mapCenter.lat() - offsetLat / 2, mapCenter.lng() - offsetLng / 2),
            new google.maps.LatLng(mapCenter.lat() + offsetLat / 2, mapCenter.lng() + offsetLng / 2)
        );

        imageOverlay = new google.maps.GroundOverlay(overlaySourceUrl, initialBounds, {
            opacity: parseFloat(document.getElementById('overlay_opacity').value) / 100 || 0.75,
            clickable: false
        });
        imageOverlay.setMap(map);

        map.fitBounds(initialBounds);
        populateBoundsInputs(initialBounds);

        document.getElementById('image_adjust_controls').style.display = 'block';
        document.getElementById('remove_image_button').style.display = 'inline-block';
        document.getElementById('no_image_message').style.display = 'none';
        document.getElementById('info_panel').dataset.lastHitIndex = -1; // Reset for new image

        if (currentSVGDoc) {
            parseAndStoreSVGElements(currentSVGDoc);
        } else { // Not an SVG or broken SVG
            parseAndStoreSVGElements(null); // Ensure SVG stuff is cleared
        }
        alert('Imagem carregada.');
    };
    reader.onerror = () => alert('Erro ao ler o arquivo.');

    if (file.type === "image/svg+xml") reader.readAsText(file);
    else if (file.type.startsWith("image/")) reader.readAsDataURL(file);
    else {
        alert("Tipo de arquivo não suportado.");
        document.getElementById('image_upload').value = '';
    }
}

/**
 * Removes image overlay and resets UI.
 */
function removeImageOverlay() {
    if (imageOverlay) {
        imageOverlay.setMap(null);
        imageOverlay = null;
    }
    currentSVGDoc = null;
    // parseAndStoreSVGElements(null) is called by applyFiltersAndSearch via reset

    document.getElementById('image_upload').value = '';
    document.getElementById('image_adjust_controls').style.display = 'none';
    document.getElementById('remove_image_button').style.display = 'none';
    document.getElementById('no_image_message').style.display = 'block';

    document.getElementById('sw_lat').value = '';
    document.getElementById('sw_lng').value = '';
    document.getElementById('ne_lat').value = '';
    document.getElementById('ne_lng').value = '';
    document.getElementById('overlay_opacity').value = 75;

    // Reset filters and search, then apply to clear displayed elements
    document.getElementById('status_filter').value = 'all';
    document.getElementById('lot_search').value = '';
    interactiveSVGElements = []; // Crucial: clear the master list before applying filters
    applyFiltersAndSearch(); // This will clear currentlyDisplayedSVGElements and hide info panel

    console.log('Image overlay removed and UI reset.');
}

window.initMap = initMap;
