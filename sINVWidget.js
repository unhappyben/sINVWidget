const WALLET_ADDRESS = "" //add your wallet here
const SINV_CONTRACT = "0x08d23468A467d2bb86FaE0e32F247A26C7E2e994"
const RPC_ENDPOINT = "https://ethereum.publicnode.com"
const INV_API_ENDPOINT = "https://www.inverse.finance/api/inv-staking?v=1.0.4"
const TEXT_COLOR = new Color("#18205d")
const BACKGROUND_COLOR = new Color("#ffc35c")
const LOGO_URL = "https://raw.githubusercontent.com/unhappyben/sINVWidget/main/Inverse%20Finance_Logo%20Kit-05.png"
const LAST_REFRESH_FILE = "lastRefreshTime_sinv.txt"

function getFont(size, weight = "regular") {
    return new Font("Inter", size)
}

async function getSInvBalance() {
    const req = new Request(RPC_ENDPOINT)
    req.method = "POST"
    req.headers = { "Content-Type": "application/json" }
    req.body = JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{
            to: SINV_CONTRACT,
            data: `0x70a08231000000000000000000000000${WALLET_ADDRESS.slice(2)}`
        }, "latest"],
        id: 1
    })
    
    try {
        const response = await req.loadJSON()
        if (response.error) return 0
        return parseInt(response.result, 16) / 1e18
    } catch (error) {
        return 0
    }
}

async function getStakingData() {
    try {
        const req = new Request(INV_API_ENDPOINT)
        const response = await req.loadJSON()
        return {
            currentApy: response.apy,
            projectedApy: response.projectedApy,
            sInvExRate: response.sInvExRate,
            invMarketPrice: response.invMarketPrice
        }
    } catch (error) {
        return {
            currentApy: 0,
            projectedApy: 0,
            sInvExRate: 1,
            invMarketPrice: 0
        }
    }
}

function saveLastRefreshTime() {
    const fm = FileManager.local()
    const path = fm.joinPath(fm.documentsDirectory(), LAST_REFRESH_FILE)
    fm.writeString(path, new Date().toISOString())
}

function getLastRefreshTime() {
    const fm = FileManager.local()
    const path = fm.joinPath(fm.documentsDirectory(), LAST_REFRESH_FILE)
    if (fm.fileExists(path)) {
        return new Date(fm.readString(path))
    }
    return null
}

function getTimestamp() {
    const lastRefreshTime = getLastRefreshTime()
    if (!lastRefreshTime) return "N/A"
    
    const now = new Date()
    const diff = Math.floor((now - lastRefreshTime) / 1000 / 60)
    return diff < 1 ? "now" : `${diff}m ago`
}

async function addLogoStack(widget) {
    const topStack = widget.addStack()
    topStack.size = new Size(165, 55)
    topStack.layoutHorizontally()
    topStack.centerAlignContent()
    
    topStack.addSpacer()
    try {
        const req = new Request(LOGO_URL)
        const logoImage = await req.loadImage()
        const logoImageWidget = topStack.addImage(logoImage)
        logoImageWidget.imageSize = new Size(140, 55)
        logoImageWidget.centerAlignImage()
    } catch (error) {
        console.error("Error loading logo:", error)
        // Fallback to text if image fails to load
        const fallbackText = topStack.addText("INVERSE")
        fallbackText.textColor = TEXT_COLOR
        fallbackText.font = getFont(16, "bold")
    }
    topStack.addSpacer()
}

async function addBalanceStack(widget) {
    const sInvBalance = await getSInvBalance()
    const stakingData = await getStakingData()
    const invBalance = sInvBalance * stakingData.sInvExRate
    const usdValue = invBalance * stakingData.invMarketPrice
    
    const mainStack = widget.addStack()
    mainStack.layoutHorizontally()
    mainStack.centerAlignContent()
    mainStack.size = new Size(165, 25)
    mainStack.addSpacer()
    
    const mainBalance = mainStack.addText(`${sInvBalance.toFixed(3)} sINV`)
    mainBalance.textColor = TEXT_COLOR
    mainBalance.font = getFont(22, "bold")
    mainStack.addSpacer()
    
    widget.addSpacer(2)
    
    const subStack = widget.addStack()
    subStack.layoutHorizontally()
    subStack.centerAlignContent()
    subStack.size = new Size(165, 20)
    subStack.addSpacer()
    
    const subBalance = subStack.addText(`${invBalance.toFixed(2)} INV · $${usdValue.toFixed(2)}`)
    subBalance.textColor = TEXT_COLOR
    subBalance.font = getFont(12)
    subStack.addSpacer()
    
    widget.addSpacer(4)
    const dividerStack = widget.addStack()
    dividerStack.layoutHorizontally()
    dividerStack.centerAlignContent()
    dividerStack.size = new Size(165, 1)
    dividerStack.addSpacer(30)
    
    const divider = dividerStack.addStack()
    divider.backgroundColor = TEXT_COLOR
    divider.size = new Size(105, 0.5)
    
    dividerStack.addSpacer(30)
    
    widget.addSpacer(4)
    
    const apyStack = widget.addStack()
    apyStack.layoutVertically()
    apyStack.size = new Size(165, 35)
    
    const currentApyStack = apyStack.addStack()
    currentApyStack.layoutHorizontally()
    currentApyStack.centerAlignContent()
    currentApyStack.addSpacer()
    const currentApy = currentApyStack.addText(`Current APY ${stakingData.currentApy.toFixed(1)}%`)
    currentApy.textColor = TEXT_COLOR
    currentApy.font = getFont(12)
    currentApyStack.addSpacer()
    
    const projectedApyStack = apyStack.addStack()
    projectedApyStack.layoutHorizontally()
    projectedApyStack.centerAlignContent()
    projectedApyStack.addSpacer()
    const projectedApy = projectedApyStack.addText(`Projected APY ${stakingData.projectedApy.toFixed(1)}%`)
    projectedApy.textColor = TEXT_COLOR
    projectedApy.font = getFont(12)
    projectedApyStack.addSpacer()
}

function addBottomTexts(widget) {
    const timestampStack = widget.addStack()
    timestampStack.layoutHorizontally()
    timestampStack.size = new Size(165, 15)
    
    timestampStack.addSpacer()
    const timestamp = timestampStack.addText(getTimestamp())
    timestamp.textColor = TEXT_COLOR
    timestamp.font = getFont(10)
    timestampStack.addSpacer()
}

async function createWidget() {
    const widget = new ListWidget()
    widget.backgroundColor = BACKGROUND_COLOR
    widget.setPadding(0,8,4,8)
    
    await addLogoStack(widget)
    widget.addSpacer(0)
    await addBalanceStack(widget)
    widget.addSpacer(0)
    addBottomTexts(widget)
    
    return widget
}

async function main() {
    const widget = await createWidget()
    
    if (config.runsInWidget) {
        Script.setWidget(widget)
    } else {
        widget.presentSmall()
    }
    
    saveLastRefreshTime()
}

await main()
Script.complete()
