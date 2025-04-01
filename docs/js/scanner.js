let scannerOn = false;
let reader = null; 

function toggleScanner() {
    const placeBtn = document.getElementById("placeBtn");
    const cameraContainer = document.getElementById("camera-container");
    const mapContainer = document.getElementById("map-container");
    
    scannerOn = !scannerOn;
    
    if (scannerOn) {
        // Show camera, hide map
        placeBtn.innerText = "CANCEL SCAN";
        cameraContainer.style.display = "block";
        mapContainer.style.display = "none";
        
        // Create a new instance only when starting to scan
        if (!reader) {
            reader = new Html5Qrcode("camera");
        }
        
        startScanner();
    } else {
        placeBtn.innerText = "SCAN QR CODE";
        stopScanner();
    }
}

function startScanner() {
    reader.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            console.log("QR Code detected, data:", decodedText);
            
            const placeNumber = parseInt(decodedText);
            if (!isNaN(placeNumber) && places[placeNumber]) {
                console.log("Valid place found:", places[placeNumber]);
                showMarkerAt(places[placeNumber]);
                toggleScanner(); // stops the scanner
            } else {
                console.error("Invalid QR code or place not found:", decodedText);
                alert("Invalid QR code: Location not found");
            }
        },
        (errorMessage) => {
            console.warn("QR scan error:", errorMessage);
        }
    ).catch((err) => {
        console.error("Error starting scanner:", err);
        alert("Camera error: " + err.message);
    });
}

async function stopScanner() {
    if (reader) {
        try {
            await reader.stop();
            console.log("Scanner stopped successfully");
        } catch (err) {
            console.error("Error stopping scanner:", err);
        }
    }
}