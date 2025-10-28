// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Sield - Secure Document Management on BlockDAG
 * @dev Smart contract for managing encrypted document access and audit trails
 * @notice This contract handles document metadata, access permissions, and immutable audit logs
 */
contract Sield {
    // Structs
    struct Document {
        string cid;           // IPFS Content Identifier
        address owner;        // Document owner wallet address
        uint256 timestamp;    // Upload timestamp
        string encryptedKey;  // Encrypted AES key (optional - for key sharing)
        bool isActive;        // Document status
    }

    struct AccessPermission {
        address user;         // Authorized wallet address
        uint256 grantedAt;    // When access was granted
        bool isActive;        // Permission status
    }

    // State variables
    mapping(string => Document) public documents;                    // cid => Document
    mapping(string => AccessPermission[]) public documentAccess;     // cid => AccessPermission[]
    mapping(string => mapping(address => uint256)) public accessIndex; // cid => user => index in access array
    mapping(address => string[]) public userDocuments;               // owner => cid[]

    // Events
    event DocumentUploaded(string indexed cid, address indexed owner, uint256 timestamp);
    event AccessGranted(string indexed cid, address indexed owner, address indexed user, uint256 timestamp);
    event AccessRevoked(string indexed cid, address indexed owner, address indexed user, uint256 timestamp);
    event DocumentAccessed(string indexed cid, address indexed user, uint256 timestamp);

    // Modifiers
    modifier onlyDocumentOwner(string memory cid) {
        require(documents[cid].owner == msg.sender, "Not document owner");
        require(documents[cid].isActive, "Document not active");
        _;
    }

    modifier documentExists(string memory cid) {
        require(documents[cid].owner != address(0), "Document does not exist");
        _;
    }

    /**
     * @dev Upload a new document to the blockchain
     * @param cid IPFS Content Identifier of the encrypted document
     * @param encryptedKey Optional encrypted AES key for secure key sharing
     */
    function uploadDocument(string memory cid, string memory encryptedKey) external {
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(documents[cid].owner == address(0), "Document already exists");

        documents[cid] = Document({
            cid: cid,
            owner: msg.sender,
            timestamp: block.timestamp,
            encryptedKey: encryptedKey,
            isActive: true
        });

        userDocuments[msg.sender].push(cid);

        emit DocumentUploaded(cid, msg.sender, block.timestamp);
    }

    /**
     * @dev Grant access to a document for a specific wallet address
     * @param cid Document Content Identifier
     * @param user Wallet address to grant access to
     */
    function grantAccess(string memory cid, address user) external
        onlyDocumentOwner(cid)
        documentExists(cid)
    {
        require(user != address(0), "Invalid user address");
        require(user != msg.sender, "Cannot grant access to yourself");

        // Check if user already has access
        uint256 index = accessIndex[cid][user];
        if (index > 0 || (documentAccess[cid].length > 0 && documentAccess[cid][0].user == user)) {
            // User already has access, reactivate if needed
            if (index > 0) {
                documentAccess[cid][index - 1].isActive = true;
            } else {
                documentAccess[cid][0].isActive = true;
            }
        } else {
            // Grant new access
            documentAccess[cid].push(AccessPermission({
                user: user,
                grantedAt: block.timestamp,
                isActive: true
            }));

            // Update index mapping (add 1 to avoid 0-index confusion)
            accessIndex[cid][user] = documentAccess[cid].length;
        }

        emit AccessGranted(cid, msg.sender, user, block.timestamp);
    }

    /**
     * @dev Revoke access to a document for a specific wallet address
     * @param cid Document Content Identifier
     * @param user Wallet address to revoke access from
     */
    function revokeAccess(string memory cid, address user) external
        onlyDocumentOwner(cid)
        documentExists(cid)
    {
        require(user != address(0), "Invalid user address");

        uint256 index = accessIndex[cid][user];
        if (index > 0) {
            documentAccess[cid][index - 1].isActive = false;
            emit AccessRevoked(cid, msg.sender, user, block.timestamp);
        } else if (documentAccess[cid].length > 0 && documentAccess[cid][0].user == user) {
            documentAccess[cid][0].isActive = false;
            emit AccessRevoked(cid, msg.sender, user, block.timestamp);
        }
        // If user doesn't have access, do nothing (idempotent)
    }

    /**
     * @dev Check if a user has access to a document
     * @param cid Document Content Identifier
     * @param user Wallet address to check
     * @return bool True if user has active access
     */
    function hasAccess(string memory cid, address user) external view
        documentExists(cid)
        returns (bool)
    {
        // Owner always has access
        if (documents[cid].owner == user) {
            return true;
        }

        uint256 index = accessIndex[cid][user];
        if (index > 0) {
            return documentAccess[cid][index - 1].isActive;
        } else if (documentAccess[cid].length > 0 && documentAccess[cid][0].user == user) {
            return documentAccess[cid][0].isActive;
        }

        return false;
    }

    /**
     * @dev Get all documents owned by a user
     * @param owner Wallet address of the document owner
     * @return string[] Array of Content Identifiers
     */
    function getUserDocuments(address owner) external view returns (string[] memory) {
        return userDocuments[owner];
    }

    /**
     * @dev Get document metadata
     * @param cid Document Content Identifier
     * @return Document struct with metadata
     */
    function getDocument(string memory cid) external view
        documentExists(cid)
        returns (Document memory)
    {
        return documents[cid];
    }

    /**
     * @dev Get all access permissions for a document
     * @param cid Document Content Identifier
     * @return AccessPermission[] Array of access permissions
     */
    function getDocumentAccess(string memory cid) external view
        documentExists(cid)
        returns (AccessPermission[] memory)
    {
        return documentAccess[cid];
    }

    /**
     * @dev Log document access (called when user accesses document)
     * @param cid Document Content Identifier
     */
    function logDocumentAccess(string memory cid) external
        documentExists(cid)
    {
        require(this.hasAccess(cid, msg.sender), "No access to document");

        emit DocumentAccessed(cid, msg.sender, block.timestamp);
    }

    /**
     * @dev Get contract version for compatibility checks
     * @return string Version identifier
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}