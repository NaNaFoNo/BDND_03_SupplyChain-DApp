// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
let SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    let sku = 1
    let upc = 1
    const ownerID = accounts[0]
    const originBeekeeperID = accounts[1]
    const originBeekeeperName = "John Doe"
    const originColonyInformation = "Sweet flying Bees"
    const originColonyLatitude = "-38.239770"
    const originColonyLongitude = "144.341490"
    let productID = sku + upc
    const productNotes = "High Flower Pollen Honey"
    const productPrice = web3.utils.toWei("1", "ether")
    let itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Beekeeper: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])


    beforeEach(async () => {
        supplyChain = await SupplyChain.deployed();
    });

    // 1st Test
    it("Testing smart contract function settleColony() that allows a beekeeper to settle a colony", async() => {
        // Setting Role
        await supplyChain.addBeekeeper(originBeekeeperID)    

        // Declare and Initialize a variable for event
        let eventEmitted = false
        
        // Watch the emitted event InProduction() 
        await supplyChain.InProduction((err, res) => {
            eventEmitted = true
        })

        // Mark honey as InProduction by calling function settleColony()
        await supplyChain.settleColony(
            upc,
            originBeekeeperID,
            originBeekeeperName,
            originColonyInformation,
            originColonyLatitude,
            originColonyLongitude,
            productNotes,
            { from: originBeekeeperID }
        )

        // Retrieve the just now saved item from blockchain by calling function fetchHoney()
        const resultBufferOne = await supplyChain.fetchHoneyBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchHoneyBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originBeekeeperID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originBeekeeperID, 'Error: Missing or Invalid originBeekeeperID')
        assert.equal(resultBufferOne[4], originBeekeeperName, 'Error: Missing or Invalid originBeekeeperName')
        assert.equal(resultBufferOne[5], originColonyInformation, 'Error: Missing or Invalid originColonyInformation')
        assert.equal(resultBufferOne[6], originColonyLatitude, 'Error: Missing or Invalid originColonyLatitude')
        assert.equal(resultBufferOne[7], originColonyLongitude, 'Error: Missing or Invalid originColonyLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')        
    })    

    // 2nd Test
    it("Testing smart contract function harvestCombs() that allows a beekeeper to harvest the combs", async() => {
        // Declare and Initialize a variable for event
        let eventEmitted = false
        
        // Watch the emitted event Harvested()
        await supplyChain.Harvested((err, res) => {
            eventEmitted = true
        })

        // Mark honey as Harvested by calling function harvestCombs()
        await supplyChain.harvestCombs(upc, { from: originBeekeeperID })
        
        // Retrieve the just now saved item from blockchain by calling function fetchHoney()
        const resultBufferTwo = await supplyChain.fetchHoneyBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
        
    })    

    // 3rd Test
    it("Testing smart contract function processHoney() that allows a beekeeper to process honey", async() => {
        // Declare and Initialize a variable for event
        let eventEmitted = false
        
        // Watch the emitted event Packed()
        await supplyChain.Processed((err, res) => {
            eventEmitted = true
        })

        // Mark honey as Processed by calling function processHoney()
        await supplyChain.processHoney(upc, { from: originBeekeeperID })

        // Retrieve the just now saved item from blockchain by calling function fetchHoney()
        const resultBufferTwo = await supplyChain.fetchHoneyBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
        
    })    

    // 4th Test
    it("Testing smart contract function sellHoney() that allows a beekeeper to sell honey", async() => {
        // Declare and Initialize a variable for event
        let eventEmitted = false
        
        // Watch the emitted event ForSale()
        await supplyChain.ForSale((err, res) => {
            eventEmitted = true
        })

        // Mark honey as ForSale by calling function sellHoney()
        await supplyChain.sellHoney(upc, productPrice, { from: originBeekeeperID })

        // Retrieve the just now saved item from blockchain by calling function fetchHoney()
        const resultBufferTwo = await supplyChain.fetchHoneyBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid product Price')
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
          
    })    

    // 5th Test
    it("Testing smart contract function buyHoney() that allows a distributor to buy honey", async() => {
        // Setting Role
        await supplyChain.addDistributor(distributorID)
        
        // Declare and Initialize a variable for event
        let eventEmitted = false
        
        // Watch the emitted event Sold()
        await supplyChain.Sold((err, res) => {
            eventEmitted = true
        })
    
        // Mark honey as Sold by calling function buyHoney()
        await supplyChain.buyHoney(upc, { from: distributorID, value: productPrice })

        // Retrieve the just now saved item from blockchain by calling function fetchHoney()
        const resultBufferOne = await supplyChain.fetchHoneyBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchHoneyBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Error: Missing or Invalid distributorID')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
        
    })    

    // 6th Test
    it("Testing smart contract function shipHoney() that allows a distributor to ship honey", async() => {
        // Declare and Initialize a variable for event
        let eventEmitted = false
        
        // Watch the emitted event Shipped()
        await supplyChain.Shipped((err, res) => {
            eventEmitted = true
        })

        // Mark honey as Shipped by calling function shipHoney()
        await supplyChain.shipHoney(upc, retailerID, { from: distributorID })

        // Retrieve the just now saved item from blockchain by calling function fetchhoney()
        const resultBufferTwo = await supplyChain.fetchHoneyBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Error: Missing or Invalid retailerID')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
              
    })    

    // 7th Test
    it("Testing smart contract function receiveHoney() that allows a retailer to mark honey received", async() => {
        // Setting Role
        await supplyChain.addRetailer(retailerID)
        
        // Declare and Initialize a variable for event
        let eventEmitted = false
        
        // Watch the emitted event Received()
        await supplyChain.Received((err, res) => {
            eventEmitted = true
        })

        // Mark honey as Received by calling function receiveHoney()
        await supplyChain.receiveHoney(upc, { from: retailerID })

        // Retrieve the just now saved item from blockchain by calling function fetchHoney()
        const resultBufferOne = await supplyChain.fetchHoneyBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchHoneyBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })    

    // 8th Test
    it("Testing smart contract function purchaseHoney() that allows a consumer to purchase honey", async() => {
        // Setting Role
        await supplyChain.addConsumer(consumerID)
        
        // Declare and Initialize a variable for event
        let eventEmitted = false
        
        // Watch the emitted event Purchased()
        await supplyChain.Purchased((err, res) => {
            eventEmitted = true
        })

        // Mark an item as Sold by calling function buyItem()
        await supplyChain.purchaseHoney(upc, { from: consumerID })
        

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchHoneyBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchHoneyBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })    

    // 9th Test
    it("Testing smart contract function fetchHoneyBufferOne() that allows anyone to fetch honey details from blockchain", async() => {

        // Retrieve the just now saved item from blockchain by calling function fetchHoney()
        const resultBufferOne = await supplyChain.fetchHoneyBufferOne.call(upc)
        
        // Verify the result set:
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originBeekeeperID, 'Error: Missing or Invalid originBeekeeperID')
        assert.equal(resultBufferOne[4], originBeekeeperName, 'Error: Missing or Invalid originBeekeeperName')
        assert.equal(resultBufferOne[5], originColonyInformation, 'Error: Missing or Invalid originColonyInformation')
        assert.equal(resultBufferOne[6], originColonyLatitude, 'Error: Missing or Invalid originColonyLatitude')
        assert.equal(resultBufferOne[7], originColonyLongitude, 'Error: Missing or Invalid originColonyLongitude')
        
    })

    // 10th Test
    it("Testing smart contract function fetchHoneyBufferTwo() that allows anyone to fetch honey details from blockchain", async() => {
        // Retrieve the just now saved item from blockchain by calling function fetchHoney()
        const resultBufferTwo = await supplyChain.fetchHoneyBufferTwo.call(upc)
        
        // Verify the result set:
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[2], productID, 'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Missing or Invalid productNotes')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid productPrice')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Missing or Invalid distributorID')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Missing or Invalid retailerID')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Missing or Invalid consumerID')
        
    })

});

