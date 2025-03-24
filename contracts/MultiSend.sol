// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract MultiSend {
    event TransferETH(address indexed recipient, uint256 amount);
    event TransferERC20(address indexed token, address indexed recipient, uint256 amount);

    function multiSend(address[] calldata recipients, uint256[] calldata amounts) external payable {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        uint256 totalSent = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            totalSent += amounts[i];
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "ETH transfer failed");
            emit TransferETH(recipients[i], amounts[i]);
        }

        require(totalSent <= msg.value, "Insufficient ETH sent");
    }

    function multiSendERC20(address token, address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        IERC20 tokenContract = IERC20(token);

        for (uint256 i = 0; i < recipients.length; i++) {
            require(tokenContract.transferFrom(msg.sender, recipients[i], amounts[i]), "ERC20 transfer failed");
            emit TransferERC20(token, recipients[i], amounts[i]);
        }
    }
}