/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types"
import { parseEther } from "ethers/lib/utils"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const greeting = "Hello World";

  const { deployer, greeter } = await getNamedAccounts();

  await deploy("Greeter", {
    from: deployer,
    args: [greeting],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
};
export default func;
func.tags = ["Greeter"];
