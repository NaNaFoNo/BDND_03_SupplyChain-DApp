pragma solidity ^0.4.24;

import "../honeyaccesscontrol/BeekeeperRole.sol";
import "../honeyaccesscontrol/DistributorRole.sol";
import "../honeyaccesscontrol/RetailerRole.sol";
import "../honeyaccesscontrol/ConsumerRole.sol";

// Define a contract 'Supplychain'
contract SupplyChain is BeekeeperRole, DistributorRole, RetailerRole, ConsumerRole {

  // Define 'owner'
  address owner;

  // Define a variable called 'upc' for Universal Product Code (UPC)
  uint  upc;

  // Define a variable called 'sku' for Stock Keeping Unit (SKU)
  uint  sku;

  // Define a public mapping 'items' that maps the UPC to an Item.
  mapping (uint => Item) items;

  // Define a public mapping 'itemsHistory' that maps the UPC to an array of TxHash, 
  // that track its journey through the supply chain -- to be sent from DApp.
  mapping (uint => string[]) itemsHistory;
  
  // Define enum 'State' with the following values:
  enum State 
  { 
    InProduction,  // 0
    Harvested,  // 1
    Processed,     // 2
    ForSale,    // 3
    Sold,       // 4
    Shipped,    // 5
    Received,   // 6
    Purchased   // 7
    }

  State constant defaultState = State.InProduction;

  // Define a struct 'Item' with the following fields:
  struct Item {
    uint    sku;  // Stock Keeping Unit (SKU)
    uint    upc; // Universal Product Code (UPC), generated by the Beekeeper, goes on the package, can be verified by the Consumer
    address ownerID;  // Metamask-Ethereum address of the current owner as the product moves through 8 stages
    address originBeekeeperID; // Metamask-Ethereum address of the Beekeeper
    string  originBeekeeperName; // Beekeeper Name
    string  originColonyInformation;  // Beekeeper Information
    string  originColonyLatitude; // Colony Latitude
    string  originColonyLongitude;  // Colony Longitude
    uint    productID;  // Product ID potentially a combination of upc + sku
    string  productNotes; // Product Notes
    uint    productPrice; // Product Price
    State   itemState;  // Product State as represented in the enum above
    address distributorID;  // Metamask-Ethereum address of the Distributor
    address retailerID; // Metamask-Ethereum address of the Retailer
    address consumerID; // Metamask-Ethereum address of the Consumer
  }

  // Define 8 events with the same 8 state values and accept 'upc' as input argument
  event InProduction(uint upc);
  event Harvested(uint upc);
  event Processed(uint upc);
  event ForSale(uint upc);
  event Sold(uint upc);
  event Shipped(uint upc);
  event Received(uint upc);
  event Purchased(uint upc);

  // Define a modifer that checks to see if msg.sender == owner of the contract
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // Define a modifer that verifies the Caller
  modifier verifyCaller (address _address) {
    require(msg.sender == _address); 
    _;
  }

  // Define a modifer that verifies the receiving retailer
  modifier verifyShipToRetailer (uint _upc) {
    require(msg.sender == items[_upc].retailerID); 
    _;
  }

  // Define a modifier that checks if the paid amount is sufficient to cover the price
  modifier paidEnough(uint _price) { 
    require(msg.value >= _price); 
    _;
  }
  
  // Define a modifier that checks the price and refunds the remaining balance
  modifier checkValue(uint _upc) {
    _;
    uint _price = items[_upc].productPrice;
    uint amountToReturn = msg.value - _price;
    items[_upc].consumerID.transfer(amountToReturn);
  }

  // Define a modifier that checks if an item.state of a upc is InProduction
  modifier inProduction(uint _upc) {
    require(items[_upc].itemState == State.InProduction);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Harvested
  modifier harvested(uint _upc) {
    require(items[_upc].itemState == State.Harvested);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Processed
  modifier processed(uint _upc) {
    require(items[_upc].itemState == State.Processed);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is ForSale
  modifier forSale(uint _upc) {
    require(items[_upc].itemState == State.ForSale);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Sold
  modifier sold(uint _upc) {
    require(items[_upc].itemState == State.Sold);
    _;
  }
  
  // Define a modifier that checks if an item.state of a upc is Shipped
  modifier shipped(uint _upc) {
    require(items[_upc].itemState == State.Shipped);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Received
  modifier received(uint _upc) {
    require(items[_upc].itemState == State.Received);
    _;
  }

  // Define a modifier that checks if an item.state of a upc is Purchased
  modifier purchased(uint _upc) {
    require(items[_upc].itemState == State.Purchased);
    _;
  }

  // In the constructor set 'owner' to the address that instantiated the contract
  // and set 'sku' to 1
  // and set 'upc' to 1
  constructor() public payable {
    owner = msg.sender;
    sku = 1;
    upc = 1;
  }

  // Define a function 'kill' if required
  function kill() public {
    if (msg.sender == owner) {
      selfdestruct(owner);
    }
  }

  // Define a function 'settleColony' that allows a beekeeper to mark the honey 'InProduction'
  function settleColony(
    uint _upc,
    string _originBeekeeperName,
    string _originColonyInformation,
    string  _originColonyLatitude,
    string  _originColonyLongitude,
    string  _productNotes
  ) public onlyBeekeeper {
    // Add the new item as part of Harvest
    items[_upc].sku = sku;
    items[_upc].upc = _upc;
    items[_upc].ownerID = msg.sender;
    items[_upc].originBeekeeperID = msg.sender;
    items[_upc].originBeekeeperName = _originBeekeeperName;
    items[_upc].originColonyInformation = _originColonyInformation;
    items[_upc].originColonyLatitude = _originColonyLatitude;
    items[_upc].originColonyLongitude = _originColonyLongitude;
    items[_upc].productNotes = _productNotes;
    items[_upc].productID = _upc + sku;
    items[_upc].itemState = State.InProduction;

    // Increment sku
    sku = sku + 1;

    // Emit the appropriate event
    emit InProduction(_upc);    
  }
  
  // Define a function 'harvestCombs' that allows a beekeeper to mark the honey 'Harvested'
  function harvestCombs(uint _upc) public onlyBeekeeper 
  // Call modifier to check if upc has passed previous supply chain stage
  inProduction(_upc)
  // Call modifier to verify caller of this function
  verifyCaller(items[_upc].ownerID)
  {
    // Update the appropriate fields
    items[_upc].itemState = State.Harvested;
    
    // Emit the appropriate event
    emit Harvested(_upc);
  }

  // Define a function 'processtHoney' that allows a beekeeper to mark the honey 'Processed'
  function processHoney(uint _upc) public onlyBeekeeper
  // Call modifier to check if upc has passed previous supply chain stage
  harvested(_upc)
  // Call modifier to verify caller of this function
  verifyCaller(items[_upc].ownerID)
  {
    // Update the appropriate fields
    items[_upc].itemState = State.Processed;
    
    // Emit the appropriate event
    emit Processed(_upc);
  }

  // Define a function 'sellHoney' that allows a beekeeper to mark the honey 'ForSale'
  function sellHoney(uint _upc, uint _price) public onlyBeekeeper
  // Call modifier to check if upc has passed previous supply chain stage
  processed(_upc)
  // Call modifier to verify caller of this function
  verifyCaller(items[_upc].ownerID)
  {
    // Update the appropriate fields
    items[_upc].itemState = State.ForSale;
    items[_upc].productPrice = _price;
    
    // Emit the appropriate event
    emit ForSale(_upc);
  }

  // Define a function 'buyHoney' that allows the disributor to mark the honey 'Sold'
  // Use the above defined modifiers to check if the honey is available for sale, if the buyer has paid enough, 
  // and any excess ether sent is refunded back to the buyer
  function buyHoney(uint _upc) public payable onlyDistributor
    // Call modifier to check if upc has passed previous supply chain stage
    forSale(_upc)
    // Call modifer to check if buyer has paid enough
    paidEnough(items[_upc].productPrice)
    // Call modifer to send any excess ether back to buyer
    checkValue(_upc)
    {
    // Update the appropriate fields - ownerID, distributorID, itemState
    items[_upc].ownerID = msg.sender;
    items[_upc].distributorID = msg.sender;
    items[_upc].itemState = State.Sold;
    
    // Transfer money to beekeeper
    items[_upc].originBeekeeperID.transfer(items[_upc].productPrice);
    
    // emit the appropriate event
    emit Sold(_upc);
  }

  // Define a function 'shipHoney' that allows the distributor to mark the honey 'Shipped'
  // Use the above modifers to check if the honey is sold
  function shipHoney(uint _upc, address _shipTo) public onlyDistributor
    // Call modifier to check if upc has passed previous supply chain stage
    sold(_upc)
    // Call modifier to verify caller of this function
    verifyCaller(items[_upc].ownerID)
    {
    // Update the appropriate fields
    items[_upc].itemState = State.Shipped;
    // address of retailer honey is shipped to
    items[_upc].retailerID = _shipTo; 
    // Emit the appropriate event
    emit Sold(_upc);
  }

  // Define a function 'receiveHoney' that allows the retailer to mark the honey 'Received'
  // Use the above modifiers to check if the honey is shipped
  function receiveHoney(uint _upc) public onlyRetailer
    // Call modifier to check if upc has passed previous supply chain stage
    shipped(_upc)
    // Access Control List enforced by calling Smart Contract / DApp
    verifyShipToRetailer(_upc)
    {
    // Update the appropriate fields - ownerID, itemState
    items[_upc].ownerID = msg.sender;
    items[_upc].itemState = State.Received;
    
    // Emit the appropriate event
    emit Received(_upc);
  }

  // Define a function 'purchaseHoney' that allows the consumer to mark the hoeny 'Purchased'
  // Use the above modifiers to check if the honey is received
  function purchaseHoney(uint _upc) public onlyConsumer
    // Call modifier to check if upc has passed previous supply chain stage
    received(_upc)
    // Access Control List enforced by calling Smart Contract / DApp
    {
    // Update the appropriate fields - ownerID, consumerID, itemState
    items[_upc].ownerID = msg.sender;
    items[_upc].consumerID = msg.sender;
    items[_upc].itemState = State.Purchased;
    // Emit the appropriate event
    emit Purchased(_upc);
  }

  // Define a function 'fetchHoneyBufferOne' that fetches the data
  function fetchHoneyBufferOne(uint _upc) public view returns 
  (
  uint    itemSKU,
  uint    itemUPC,
  address ownerID,
  address originBeekeeperID,
  string  originBeekeeperName,
  string  originColonyInformation,
  string  originColonyLatitude,
  string  originColonyLongitude
  ) 
  {
  // Assign values to the 8 parameters
    itemSKU = items[_upc].sku;
    itemUPC = items[_upc].upc;
    ownerID = items[_upc].ownerID;
    originBeekeeperID = items[_upc].originBeekeeperID;
    originBeekeeperName = items[_upc].originBeekeeperName;
    originColonyInformation = items[_upc].originColonyInformation;
    originColonyLatitude = items[_upc].originColonyLatitude;
    originColonyLongitude = items[_upc].originColonyLongitude;
    
  return 
  (
  itemSKU,
  itemUPC,
  ownerID,
  originBeekeeperID,
  originBeekeeperName,
  originColonyInformation,
  originColonyLatitude,
  originColonyLongitude
  );
  }

  // Define a function 'fetchHoneyBufferTwo' that fetches the data
  function fetchHoneyBufferTwo(uint _upc) public view returns 
  (
  uint    itemSKU,
  uint    itemUPC,
  uint    productID,
  string  productNotes,
  uint    productPrice,
  uint    itemState,
  address distributorID,
  address retailerID,
  address consumerID
  ) 
  {
    // Assign values to the 9 parameters
    itemSKU = items[_upc].sku;
    itemUPC = items[_upc].upc;
    productID = items[_upc].productID;
    productNotes = items[_upc].productNotes;
    productPrice = items[_upc].productPrice;
    itemState = uint(items[_upc].itemState);
    distributorID = items[_upc].distributorID;
    retailerID = items[_upc].retailerID;
    consumerID = items[_upc].consumerID;
  
  return 
  (
  itemSKU,
  itemUPC,
  productID,
  productNotes,
  productPrice,
  itemState,
  distributorID,
  retailerID,
  consumerID
  );
  }
}