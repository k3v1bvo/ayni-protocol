// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AyniEscrow
 * @dev Smart Contract de Custodia para el Protocolo AYNI / MINKA
 * Buildathon ETH Bolivia 2026 - Red Base L2
 */

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract AyniEscrow is ReentrancyGuard {
    enum State {
        CREATED,
        FUNDED,
        VERIFIED_AI,
        SHIPPED,
        COMPLETED,
        DISPUTED,
        REFUNDED
    }

    enum TradeType {
        STORE,
        TRAVELER_BUY,
        TRAVELER_CROWDSHIP,
        REMITTANCE
    }

    struct Trade {
        address buyer;
        address traveler;
        uint256 purchaseAmount; // Valor de compra en mostrador
        uint256 feeAmount;      // Honorario del transportista
        uint256 systemFee;      // Comision retenida
        TradeType tradeType;
        State state;
        bytes32 secretOtpHash;  // Hash SHA-256 / Keccak256 del codigo alfanumerico de 6 caracteres
        uint256 createdAt;
        uint256 autoReleaseTime;
    }

    IERC20 public immutable usdcToken;
    address public platformTreasury;
    address public guaranteeReserveFund;
    address public aiOracle;

    mapping(uint256 => Trade) public trades;
    uint256 public tradeCounter;

    event TradeCreated(uint256 indexed tradeId, address indexed buyer, address indexed traveler);
    event FundsDeposited(uint256 indexed tradeId, uint256 totalAmount);
    event ProofVerifiedAI(uint256 indexed tradeId, bool approved);
    event TradeCompleted(uint256 indexed tradeId, uint256 payoutTraveler);

    modifier onlyAI() {
        require(msg.sender == aiOracle, "Solo el oraculo IA puede ejecutar esta accion");
        _;
    }

    constructor(
        address _token,
        address _treasury,
        address _reserve,
        address _aiOracle
    ) {
        usdcToken = IERC20(_token);
        platformTreasury = _treasury;
        guaranteeReserveFund = _reserve;
        aiOracle = _aiOracle;
    }

    function createTrade(
        address _traveler,
        uint256 _purchaseAmount,
        uint256 _feeAmount,
        uint256 _systemFee,
        TradeType _type,
        bytes32 _otpHash
    ) external nonReentrant returns (uint256) {
        uint256 totalCost = _purchaseAmount + _feeAmount + _systemFee;
        require(
            usdcToken.transferFrom(msg.sender, address(this), totalCost),
            "Error en transferencia Escrow"
        );

        tradeCounter++;
        trades[tradeCounter] = Trade({
            buyer: msg.sender,
            traveler: _traveler,
            purchaseAmount: _purchaseAmount,
            feeAmount: _feeAmount,
            systemFee: _systemFee,
            tradeType: _type,
            state: State.FUNDED,
            secretOtpHash: _otpHash,
            createdAt: block.timestamp,
            autoReleaseTime: block.timestamp + 7 days
        });

        emit TradeCreated(tradeCounter, msg.sender, _traveler);
        emit FundsDeposited(tradeCounter, totalCost);
        return tradeCounter;
    }

    function verifyProofByAI(uint256 _tradeId, bool _approved) external onlyAI {
        Trade storage t = trades[_tradeId];
        require(t.state == State.FUNDED, "Estado invalido");
        if (_approved) {
            t.state = State.VERIFIED_AI;
            emit ProofVerifiedAI(_tradeId, true);
        } else {
            t.state = State.DISPUTED;
            emit ProofVerifiedAI(_tradeId, false);
        }
    }

    function completeTrade(uint256 _tradeId, string calldata _otpCode) external nonReentrant {
        Trade storage t = trades[_tradeId];
        require(
            t.state == State.VERIFIED_AI || t.state == State.SHIPPED,
            "Pedido no listo para entrega"
        );
        require(
            keccak256(abi.encodePacked(_otpCode)) == t.secretOtpHash,
            "OTP de 6 digitos incorrecto"
        );

        t.state = State.COMPLETED;

        // Distribucion: Costo compra + honorario al viajero
        uint256 travelerPayout = t.purchaseAmount + t.feeAmount;
        require(usdcToken.transfer(t.traveler, travelerPayout), "Fallo transferencia viajero");

        // Division de comision: Balance operativo y Fondo Comunitario (20% del fee al fondo de reserva)
        uint256 reserveCut = (t.systemFee * 20) / 100;
        uint256 systemCut = t.systemFee - reserveCut;

        if (reserveCut > 0) {
            require(usdcToken.transfer(guaranteeReserveFund, reserveCut), "Fallo transferencia reserva");
        }
        if (systemCut > 0) {
            require(usdcToken.transfer(platformTreasury, systemCut), "Fallo transferencia tesoreria");
        }

        emit TradeCompleted(_tradeId, travelerPayout);
    }
}
