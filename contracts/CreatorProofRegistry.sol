// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreatorProofRegistry
 * @dev Immutable blockchain registry for digital content ownership & SHA-256 cryptographic proof verification.
 */
contract CreatorProofRegistry is Ownable {
    struct ContentRecord {
        string contentId;
        string contentHash;
        address creator;
        uint256 timestamp;
        string metadataURI;
        bool active;
    }

    // Mapping from contentId => ContentRecord
    mapping(string => ContentRecord) private _records;

    // Mapping from contentHash => contentId (prevents duplicate hash registrations)
    mapping(string => string) private _hashToContentId;

    // Events
    event ContentRegistered(
        string indexed contentId,
        string contentHash,
        address indexed creator,
        uint256 timestamp,
        string metadataURI
    );

    event ContentRevoked(
        string indexed contentId,
        address indexed creator,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Registers a new digital work with SHA-256 hash and IPFS metadata URI.
     */
    function registerContent(
        string memory contentId,
        string memory contentHash,
        string memory metadataURI
    ) external returns (bool) {
        require(bytes(contentId).length > 0, "Content ID required");
        require(bytes(contentHash).length > 0, "Content hash required");
        require(_records[contentId].timestamp == 0, "Content ID already registered");
        require(bytes(_hashToContentId[contentHash]).length == 0, "Duplicate content hash already registered");

        _records[contentId] = ContentRecord({
            contentId: contentId,
            contentHash: contentHash,
            creator: msg.sender,
            timestamp: block.timestamp,
            metadataURI: metadataURI,
            active: true
        });

        _hashToContentId[contentHash] = contentId;

        emit ContentRegistered(
            contentId,
            contentHash,
            msg.sender,
            block.timestamp,
            metadataURI
        );

        return true;
    }

    /**
     * @dev Verifies whether a given contentId and hash match the on-chain record.
     */
    function verifyContent(
        string memory contentId,
        string memory hash
    )
        external
        view
        returns (
            bool matches,
            address creator,
            uint256 timestamp,
            string memory metadataURI,
            bool active
        )
    {
        ContentRecord memory record = _records[contentId];
        if (record.timestamp == 0) {
            return (false, address(0), 0, "", false);
        }

        bool hashMatches = (keccak256(abi.encodePacked(record.contentHash)) == keccak256(abi.encodePacked(hash)));
        return (hashMatches && record.active, record.creator, record.timestamp, record.metadataURI, record.active);
    }

    /**
     * @dev Revokes a registration. Only original creator or contract owner can call.
     */
    function revokeContent(string memory contentId) external returns (bool) {
        ContentRecord storage record = _records[contentId];
        require(record.timestamp > 0, "Content ID not found");
        require(record.active, "Content already revoked");
        require(msg.sender == record.creator || msg.sender == owner(), "Unauthorized: Only creator or owner can revoke");

        record.active = false;

        emit ContentRevoked(contentId, record.creator, block.timestamp);
        return true;
    }

    /**
     * @dev Gets full details of a registered content ID.
     */
    function getContent(string memory contentId) external view returns (ContentRecord memory) {
        require(_records[contentId].timestamp > 0, "Content ID not found");
        return _records[contentId];
    }
}
