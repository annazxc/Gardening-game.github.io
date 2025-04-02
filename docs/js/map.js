function showMarkerAt(place) {
    let marker = document.getElementById("marker");
    let mapContainer = document.getElementById("map-container");
    let cameraContainer = document.getElementById("camera-container");
    let map = document.getElementById("map");
    let sleepBtn = document.getElementById("sleepBtn");
    
    if (marker && place) {
        marker.style.top = `${place.top * 100}%`;
        marker.style.left = `${place.left * 100}%`;
        
        // Update markerPosition
        markerPosition.top = place.top;
        markerPosition.left = place.left;
        markerPosition.level = place.level;
        
       
        map.src = `assets/images/level_${place.level}.png`;
        
        if (place.info === "Resting Area") {
            sleepBtn.style.display = "block";
            sleepBtn.onclick = function() {
                showCaveEntrance();
            };
            document.getElementById("startExploringBtn").style.display = "none";
            document.getElementById("worldMapBtn").style.display = "none";
        } else {
            sleepBtn.style.display = "none";
            document.getElementById("startExploringBtn").style.display = "block";
            document.getElementById("worldMapBtn").style.display = "block";
        }
        
        cameraContainer.style.display = "none";
        mapContainer.style.display = "block";
        
        // Set up controls after map is visible
        setTimeout(function() {
            setupControls();
            mapContainer.focus(); 
        }, 100);
    } else {
        console.error("Marker element or place data is missing");
    }
}
function showCaveEntrance() {
    let map = document.getElementById("map");
    let marker = document.getElementById("marker");
    map.src = "assets/images/level_1.png";
    
    marker.style.top = "50%";
    marker.style.left = "50%";
    document.getElementById("sleepBtn").style.display = "none";
}