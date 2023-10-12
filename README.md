# Raffle contract on Polygon

## Quickstart
```
git clone https://github.com/Gouldian0120/raffle_polygon
cd raffle_polygon
yarn

```

Edit .env:

```
cp .env.example .env

```

Deploy:

```
npx hardhat run scripts/raffle.vrf.deploy.js --network polygonMumbai

```

Test:

```
npx hardhat test tests/polygon.test.js --network polygonMumbai

```

# Address of contracts deployed on the polygon mumbai testnet

### Raffle
0x0524374f38B288D82fcd421C10a50Bc166CD0EAB

### USDT
0x1d8cac74e931f9babc9d41db9a2b9c7ef7d76cbb

### ERC721
0x702DEb044f6f81d9dB7f4Ff23Ae4085b5f2c2273

### ERC20
0x1d8CAC74E931F9BabC9D41dB9A2B9C7Ef7D76CbB