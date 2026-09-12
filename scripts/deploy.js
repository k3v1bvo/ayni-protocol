const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

// USDC oficial de Circle donde ya existe. Las redes sin entrada aca usan un MockUSDC propio.
const OFFICIAL_USDC = {
  avalancheFuji: '0x5425890298aed601595a70AB815c96711a31Bc65',
  avalancheMainnet: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
};

async function main() {
  const networkName = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();

  console.log(`\n== Deploy AyniEscrow en "${networkName}" ==`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))}`);

  // 1. Token USDC: usa el oficial si existe para esta red, si no despliega un mock de prueba
  let tokenAddress = process.env.TOKEN_ADDRESS || OFFICIAL_USDC[networkName];
  if (!tokenAddress) {
    console.log('\nNo hay USDC oficial configurado para esta red — desplegando MockUSDC de prueba...');
    const MockUSDC = await hre.ethers.getContractFactory('MockUSDC');
    const mock = await MockUSDC.deploy(hre.ethers.parseUnits('1000000', 6));
    await mock.waitForDeployment();
    tokenAddress = await mock.getAddress();
    console.log(`MockUSDC desplegado en: ${tokenAddress}`);
  } else {
    console.log(`\nUsando USDC: ${tokenAddress}`);
  }

  // 2. Direcciones de tesoreria / reserva / oraculo IA (por defecto, la del deployer)
  const treasury = process.env.TREASURY_ADDRESS || deployer.address;
  const reserve = process.env.RESERVE_ADDRESS || deployer.address;
  const aiOracle = process.env.AI_ORACLE_ADDRESS || deployer.address;

  // 3. Deploy de AyniEscrow
  const AyniEscrow = await hre.ethers.getContractFactory('AyniEscrow');
  const escrow = await AyniEscrow.deploy(tokenAddress, treasury, reserve, aiOracle);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();

  console.log(`\nAyniEscrow desplegado en: ${escrowAddress}`);

  // 4. Guarda el resultado para no perderlo
  const outDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, `${networkName}.json`);
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        network: networkName,
        chainId: hre.network.config.chainId,
        deployer: deployer.address,
        AyniEscrow: escrowAddress,
        USDC: tokenAddress,
        treasury,
        reserve,
        aiOracle,
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log(`Guardado en: ${outFile}`);
  console.log('\nListo. Para verificar el contrato:');
  console.log(`npx hardhat verify --network ${networkName} ${escrowAddress} ${tokenAddress} ${treasury} ${reserve} ${aiOracle}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
