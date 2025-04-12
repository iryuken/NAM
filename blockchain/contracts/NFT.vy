# @version 0.3.7

"""
@title MyFirstNFT Contract by 1ryuken
@dev ERC721 compliant NFT contract with URI storage
"""

# Imports
from vyper.interfaces import ERC721

# Events
event Transfer:
    _from: indexed(address)
    _to: indexed(address)
    _tokenId: indexed(uint256)

event Approval:
    _owner: indexed(address)
    _approved: indexed(address)
    _tokenId: indexed(uint256)

event ApprovalForAll:
    _owner: indexed(address)
    _operator: indexed(address)
    _approved: bool

# State Variables
name: public(String[32])
symbol: public(String[32])
s_marketplaceAddress: address
tokenURIs: public(HashMap[uint256, String[256]])
idToOwner: HashMap[uint256, address]
ownerToNFTokenCount: HashMap[address, uint256]
idToApprovals: HashMap[uint256, address]
ownerToOperators: HashMap[address, HashMap[address, bool]]
s_tokenIds: uint256

@external
def __init__(_marketplaceAddress: address):
    """
    @dev Contract constructor
    @param _marketplaceAddress The address of the marketplace contract
    """
    self.name = "MyFirstNFT"
    self.symbol = "nft"
    self.s_marketplaceAddress = _marketplaceAddress
    self.s_tokenIds = 0

@view
@external
def balanceOf(_owner: address) -> uint256:
    """
    @dev Returns the number of NFTs owned by a specific address
    @param _owner The address to query the balance of
    @return Token count
    """
    assert _owner != ZERO_ADDRESS, "Zero address"
    return self.ownerToNFTokenCount[_owner]

@view
@external
def ownerOf(_tokenId: uint256) -> address:
    """
    @dev Returns the owner of a specified token ID
    @param _tokenId The token ID to query
    @return Owner address
    """
    owner: address = self.idToOwner[_tokenId]
    assert owner != ZERO_ADDRESS, "Owner query for nonexistent token"
    return owner

@view
@external
def getApproved(_tokenId: uint256) -> address:
    """
    @dev Gets the approved address for a token ID
    @param _tokenId The token to query the approval of
    @return Address currently approved for the given token ID
    """
    assert self.idToOwner[_tokenId] != ZERO_ADDRESS, "Nonexistent token"
    return self.idToApprovals[_tokenId]

@view
@external
def isApprovedForAll(_owner: address, _operator: address) -> bool:
    """
    @dev Tells whether an operator is approved by a given owner
    @param _owner Owner address
    @param _operator Operator address
    @return True if the operator is approved, false otherwise
    """
    return self.ownerToOperators[_owner][_operator]

@external
def approve(_approved: address, _tokenId: uint256):
    """
    @dev Approves another address to transfer a specific token
    @param _approved The address to be approved for the given token ID
    @param _tokenId The token ID to be approved
    """
    owner: address = self.idToOwner[_tokenId]
    assert owner != ZERO_ADDRESS, "Nonexistent token"
    assert _approved != owner, "Cannot approve self"
    assert msg.sender == owner or self.ownerToOperators[owner][msg.sender], "Not authorized"
    
    self.idToApprovals[_tokenId] = _approved
    log Approval(owner, _approved, _tokenId)

@external
def setApprovalForAll(_operator: address, _approved: bool):
    """
    @dev Sets or unsets the approval of a given operator
    @param _operator Operator address
    @param _approved True if the operator is approved, false to revoke approval
    """
    assert _operator != msg.sender, "Cannot approve self"
    self.ownerToOperators[msg.sender][_operator] = _approved
    log ApprovalForAll(msg.sender, _operator, _approved)

@external
def transferFrom(_from: address, _to: address, _tokenId: uint256):
    """
    @dev Transfers the ownership of a token from one address to another
    @param _from The address from which to transfer
    @param _to The address to which to transfer the token
    @param _tokenId The token ID to transfer
    """
    assert self._isApprovedOrOwner(msg.sender, _tokenId), "Not authorized"
    assert _to != ZERO_ADDRESS, "Cannot transfer to zero address"
    
    self._clearApproval(_from, _tokenId)
    self._removeTokenFrom(_from, _tokenId)
    self._addTokenTo(_to, _tokenId)
    
    log Transfer(_from, _to, _tokenId)

@external
def safeTransferFrom(_from: address, _to: address, _tokenId: uint256, _data: Bytes[1024]=b""):
    """
    @dev Safely transfers the ownership of a token from one address to another
    @param _from The address from which to transfer
    @param _to The address to which to transfer the token
    @param _tokenId The token ID to transfer
    @param _data Additional data with no specified format
    """
    assert self._isApprovedOrOwner(msg.sender, _tokenId), "Not authorized"
    assert _to != ZERO_ADDRESS, "Cannot transfer to zero address"
    
    self._clearApproval(_from, _tokenId)
    self._removeTokenFrom(_from, _tokenId)
    self._addTokenTo(_to, _tokenId)
    
    log Transfer(_from, _to, _tokenId)
    
    # Check if recipient is a contract
    if _to.is_contract:
        returnValue: bytes4 = ERC721(_to).onERC721Received(msg.sender, _from, _tokenId, _data)
        assert returnValue == method_id("onERC721Received(address,address,uint256,bytes)", output_type=bytes4)

@external
def mintToken(_tokenURI: String[256]) -> uint256:
    """
    @dev Mints a new token with the specified token URI
    @param _tokenURI The token URI for the new token
    @return The ID of the newly minted token
    """
    self.s_tokenIds += 1
    newTokenId: uint256 = self.s_tokenIds
    
    self._mint(msg.sender, newTokenId)
    self.tokenURIs[newTokenId] = _tokenURI
    
    # Instead of calling self.setApprovalForAll, update the state directly
    self.ownerToOperators[msg.sender][self.s_marketplaceAddress] = True
    log ApprovalForAll(msg.sender, self.s_marketplaceAddress, True)
    
    return newTokenId

@view
@external
def tokenURI(_tokenId: uint256) -> String[256]:
    """
    @dev Returns the URI for a given token ID
    @param _tokenId The token ID to query
    @return The token URI
    """
    assert self.idToOwner[_tokenId] != ZERO_ADDRESS, "Nonexistent token"
    return self.tokenURIs[_tokenId]

@internal
def _isApprovedOrOwner(_spender: address, _tokenId: uint256) -> bool:
    """
    @dev Returns whether the spender can transfer a specific token
    @param _spender The address that wants to transfer the token
    @param _tokenId The token ID
    @return True if allowed to transfer
    """
    owner: address = self.idToOwner[_tokenId]
    spenderIsOwner: bool = owner == _spender
    spenderIsApproved: bool = _spender == self.idToApprovals[_tokenId]
    spenderIsApprovedForAll: bool = self.ownerToOperators[owner][_spender]
    
    return (spenderIsOwner or spenderIsApproved or spenderIsApprovedForAll)

@internal
def _mint(_to: address, _tokenId: uint256):
    """
    @dev Internal function to mint a new token
    @param _to The address that will own the minted token
    @param _tokenId The token ID
    """
    assert _to != ZERO_ADDRESS, "Cannot mint to zero address"
    assert self.idToOwner[_tokenId] == ZERO_ADDRESS, "Token already exists"
    
    self.idToOwner[_tokenId] = _to
    self.ownerToNFTokenCount[_to] += 1
    
    log Transfer(ZERO_ADDRESS, _to, _tokenId)

@internal
def _addTokenTo(_to: address, _tokenId: uint256):
    """
    @dev Adds a token to an address
    @param _to The address receiving the token
    @param _tokenId The token ID
    """
    self.idToOwner[_tokenId] = _to
    self.ownerToNFTokenCount[_to] += 1

@internal
def _removeTokenFrom(_from: address, _tokenId: uint256):
    """
    @dev Removes a token from an address
    @param _from The address that owns the token
    @param _tokenId The token ID
    """
    assert self.idToOwner[_tokenId] == _from, "Not token owner"
    self.idToOwner[_tokenId] = ZERO_ADDRESS
    self.ownerToNFTokenCount[_from] -= 1

@internal
def _clearApproval(_owner: address, _tokenId: uint256):
    """
    @dev Clears approval for a token
    @param _owner The current owner of the token
    @param _tokenId The token ID
    """
    assert self.idToOwner[_tokenId] == _owner, "Not token owner"
    if self.idToApprovals[_tokenId] != ZERO_ADDRESS:
        self.idToApprovals[_tokenId] = ZERO_ADDRESS 