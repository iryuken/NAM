# @version 0.3.7

"""
@title NFT Marketplace Contract
@dev A marketplace for buying and selling NFTs
"""

# Imports
from vyper.interfaces import ERC721

# Events
event ItemList:
    itemId: indexed(uint256)
    nftAddress: indexed(address)
    tokenId: indexed(uint256)
    seller: address
    owner: address
    price: uint256
    sold: bool

event ItemBought:
    nftAddress: indexed(address)
    tokenId: indexed(uint256)
    seller: address
    owner: address
    price: uint256
    sold: bool

# Structs
struct Item:
    itemId: uint256
    nftContract: address
    tokenId: uint256
    seller: address
    owner: address
    price: uint256
    sold: bool

# State Variables
s_nftIds: uint256
s_nftSold: uint256
owner: address
listingPrice: uint256
Items: HashMap[uint256, Item]

@external
def __init__():
    """
    @dev Contract constructor
    """
    self.owner = msg.sender
    self.listingPrice = as_wei_value(0.025, "ether")
    self.s_nftIds = 0
    self.s_nftSold = 0

@view
@external
def getListingPrice() -> uint256:
    """
    @dev Returns the listing price for the marketplace
    @return Listing price
    """
    return self.listingPrice

@view
@external
def getAllListedItems() -> DynArray[Item, 100]:
    """
    @dev Returns all items that are listed on the marketplace
    @return Array of items
    """
    itemCount: uint256 = self.s_nftIds
    unSoldItemsCount: uint256 = self.s_nftIds - self.s_nftSold
    currentIndex: uint256 = 0
    
    items: DynArray[Item, 100] = []
    
    for i in range(100):
        if i >= itemCount:
            break
        
        if self.Items[i + 1].owner == ZERO_ADDRESS:
            currentId: uint256 = self.Items[i + 1].itemId
            currentItem: Item = self.Items[currentId]
            items.append(currentItem)
            currentIndex += 1
            
            if currentIndex >= unSoldItemsCount:
                break
    
    return items

@view
@external
def getOwnerListedItems() -> DynArray[Item, 100]:
    """
    @dev Returns all items that are owned by the caller
    @return Array of items
    """
    totalListedItems: uint256 = self.s_nftIds
    itemCount: uint256 = 0
    currentIndex: uint256 = 0
    
    # First, count how many items the caller owns
    for i in range(100):
        if i >= totalListedItems:
            break
        
        if self.Items[i + 1].owner == msg.sender:
            itemCount += 1
    
    items: DynArray[Item, 100] = []
    
    # Then, populate the items array
    for i in range(100):
        if i >= totalListedItems:
            break
        
        if self.Items[i + 1].owner == msg.sender:
            currentId: uint256 = self.Items[i + 1].itemId
            currentItem: Item = self.Items[currentId]
            items.append(currentItem)
            currentIndex += 1
            
            if currentIndex >= itemCount:
                break
    
    return items

@view
@external
def getSellerListedItems() -> DynArray[Item, 100]:
    """
    @dev Returns all items that are listed by the caller
    @return Array of items
    """
    totalListedItems: uint256 = self.s_nftIds
    itemCount: uint256 = 0
    currentIndex: uint256 = 0
    
    # First, count how many items the caller is selling
    for i in range(100):
        if i >= totalListedItems:
            break
        
        if self.Items[i + 1].seller == msg.sender:
            itemCount += 1
    
    items: DynArray[Item, 100] = []
    
    # Then, populate the items array
    for i in range(100):
        if i >= totalListedItems:
            break
        
        if self.Items[i + 1].seller == msg.sender:
            currentId: uint256 = self.Items[i + 1].itemId
            currentItem: Item = self.Items[currentId]
            items.append(currentItem)
            currentIndex += 1
            
            if currentIndex >= itemCount:
                break
    
    return items

@view
@external
def getPerticularItem(_itemId: uint256) -> Item:
    """
    @dev Returns a specific item by its ID
    @param _itemId The ID of the item
    @return Item struct
    """
    return self.Items[_itemId]

@external
def listItem(_nftAddress: address, _tokenId: uint256, _price: uint256):
    """
    @dev Lists an NFT on the marketplace
    @param _nftAddress The address of the NFT contract
    @param _tokenId The token ID of the NFT
    @param _price The price at which to list the NFT
    """
    assert _price > 0, "NFTMarketplace__ItemPriceIsLessThenZero"
    
    self.s_nftIds += 1
    newNftId: uint256 = self.s_nftIds
    
    self.Items[newNftId] = Item({
        itemId: newNftId,
        nftContract: _nftAddress,
        tokenId: _tokenId,
        seller: msg.sender,
        owner: ZERO_ADDRESS,
        price: _price,
        sold: False
    })
    
    ERC721(_nftAddress).transferFrom(msg.sender, self, _tokenId)
    
    log ItemList(newNftId, _nftAddress, _tokenId, msg.sender, ZERO_ADDRESS, _price, False)

@external
def updateItemPrice(_itemId: uint256, _price: uint256):
    """
    @dev Updates the price of an item
    @param _itemId The ID of the item
    @param _price The new price
    """
    assert msg.sender == self.Items[_itemId].seller, "NFTMarketplace__YouAreNotOwnerOfThisItem"
    assert _price > 0, "NFTMarketplace__ItemPriceIsLessThenZero"
    
    self.Items[_itemId].price = _price

@payable
@external
def buyItem(_nftAddress: address, _itemId: uint256):
    """
    @dev Allows a user to buy an item
    @param _nftAddress The address of the NFT contract
    @param _itemId The ID of the item
    """
    price: uint256 = self.Items[_itemId].price
    tokenId: uint256 = self.Items[_itemId].tokenId
    seller: address = self.Items[_itemId].seller
    
    assert msg.value == price, "NFTMarketplace__ItemPriceNotMet"
    
    # Transfer the value to the seller
    send(seller, msg.value)
    
    # Transfer the NFT to the buyer
    ERC721(_nftAddress).transferFrom(self, msg.sender, tokenId)
    
    # Update the item
    self.Items[_itemId].owner = msg.sender
    self.Items[_itemId].sold = True
    self.s_nftSold += 1
    
    log ItemBought(_nftAddress, tokenId, ZERO_ADDRESS, msg.sender, price, True)
    
    # Transfer the listing fee to the contract owner
    send(self.owner, self.listingPrice)

@payable
@external
def resellItem(_nftAddress: address, _tokenId: uint256, _price: uint256):
    """
    @dev Allows an owner to resell an NFT
    @param _nftAddress The address of the NFT contract
    @param _tokenId The token ID of the NFT
    @param _price The price at which to list the NFT
    """
    assert self.Items[_tokenId].owner == msg.sender, "NFTMarketplace__YouAreNotOwnerOfThisItem"
    assert msg.value == self.listingPrice, "NFTMarketplace__ItemPriceNotMet"
    
    self.Items[_tokenId].sold = False
    self.Items[_tokenId].price = _price
    self.Items[_tokenId].seller = msg.sender
    self.Items[_tokenId].owner = ZERO_ADDRESS
    self.s_nftSold -= 1
    
    ERC721(_nftAddress).transferFrom(msg.sender, self, _tokenId) 