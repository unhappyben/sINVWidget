# Inverse Finance sINV Widget
An iOS widget that tracks sINV balance, INV amount, current and predicted APY and USD value. 

# Requirements
- Download Scriptable from the iOS App Store
- Arbitrum wallet address with strategy deposits

# Features
- INV USD Value
- sINV Amount
- INV Amount
- Current APY
- Predicted APY

# Widget Display
![sINV](https://github.com/user-attachments/assets/688f422f-2676-4047-a3c8-8092aa7fbcc5)

# Setup Instructions
1. Install Scriptable from the iOS App Store
2. Create a new script in Scriptable
3. Copy the script code
4. Update the following constants with your information:

      ```javascriptCopyconst WALLET_ADDRESS = ""```
5. Add the widget to your home screen:

      - Long press your home screen
      - Tap the + button
      - Search for "Scriptable"
      - Choose the widget size (small recommended)
      - Select your script

# Technical Details
- Uses Ethereum RPC for sINV amount
- Use Inverse API to get data
- Stores historical on local iPhone storage
