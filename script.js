const API_KEY = "2453534f-1818-49bb-beb7-4cb2b22f64bd"; 

let auctionItems = [];
let auctionInterval;

async function fetchAuctions() {
    try {
        let response = await fetch(`https://api.hypixel.net/skyblock/auctions?page=0&key=${API_KEY}`);
        let data = await response.json();

        if (!data.success) {
            console.error('API error:', data);
            return;
        }

        const totalPages = data.totalPages;
        let allAuctions = [];

        for (let i = 0; i < Math.min(3, totalPages); i++) {
            response = await fetch(`https://api.hypixel.net/skyblock/auctions?page=${i}&key=${API_KEY}`);
            data = await response.json();
            if (data.success) {
                allAuctions.push(...data.auctions);
            }
        }

        auctionItems = allAuctions.filter(item => item.item_name); 
        console.log(`Loaded ${auctionItems.length} auctions.`);
    } catch (error) {
        console.error('Error fetching auctions:', error);
    }
}


function getRandomAuction() {
    if (auctionItems.length === 0) {
        document.getElementById("auctionItem").textContent = "No available auctions.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * auctionItems.length);
    const randomAuction = auctionItems.splice(randomIndex, 1)[0];
    const itemName = randomAuction.item_name;

    const itemPrice = randomAuction.starting_bid.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const auctionEnd = new Date(randomAuction.end).toLocaleString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    }).replace(',', '').replace(' ', '; ');

    const updateTimeLeft = () => {
        const timeLeft = new Date(randomAuction.end - Date.now());
        const hours = timeLeft.getUTCHours() < 100 ? String(timeLeft.getUTCHours()) : String(timeLeft.getUTCHours()).padStart(3, '0');
        const minutes = String(timeLeft.getUTCMinutes()).padStart(2, '0');    
        const seconds = String(timeLeft.getUTCSeconds()).padStart(2, '0');
        const timeLeftString = `${hours}:${minutes}:${seconds}`;

        const isBin = randomAuction.bin ? "BIN Auction ✅" : "Normal Auction ⚖️";

        document.getElementById("auctionItem").innerHTML = `




            🛒 <strong>${itemName}</strong><br>
            💰 Price: ${itemPrice} coins<br>
            ⏳ Ends at: ${auctionEnd}<br>
            ⏳ Time left: ${timeLeftString}<br>
            ${isBin}
        `;
    };

    updateTimeLeft();
    clearInterval(auctionInterval);
    auctionInterval = setInterval(updateTimeLeft, 1000);

}fetchAuctions();

document.getElementById("fetchItem").addEventListener("click", () => {
    getRandomAuction();
    if (auctionItems.length === 0) {
        fetchAuctions();
    }
});

async function getItemTexture(itemId) {
    try {
        const response = await fetch(`https://api.mojang.com/minecraft/item/${itemId}/texture`);
        const textureData = await response.json();
        return `https://textures.minecraft.net/texture/${textureData.texture_id}`;
    } catch (error) {
        return 'default-item-image.png';
    }
}
