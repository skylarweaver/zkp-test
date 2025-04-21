# Merkle Tree Test Data Generator

This project generates test data for Merkle tree verification circuits, specifically for the `valueinmerkle.circom` circuit.

## Installation

```bash
npm install
```

## Usage

Run the script with default values:

```bash
node src/generate-merkle-data.js
```

This will create a Merkle tree with values [5,6,7,8,9] and generate a proof for value 5.

### Command-line Options

You can customize the values and the value to prove:

```bash
node src/generate-merkle-data.js --values 10,20,30,40,50 --prove 30
```

Or using short options:

```bash
node src/generate-merkle-data.js -v 10,20,30,40,50 -p 30
```

### Help

To see all available options:

```bash
node src/generate-merkle-data.js --help
```

## Output

The script outputs:
1. The Merkle tree values
2. The Merkle root
3. The index of the value being proven
4. The Merkle proof (siblings)
5. A JSON object formatted for use with the `valueinmerkle.circom` circuit

## Circuit Integration

The output JSON can be used directly as input for the `valueinmerkle.circom` circuit:

```json
{
  "value": "5",
  "merkleProof": [
    "4204312525841135841975512941763794313765175850880841168060295322266705003157", 
    "7061949393491957813657776856458368574501817871421526214197139795307327923534",
    "8761383103374198182292249284037598775384145428470309206166618811601037048804" 
  ],
  "merkleRoot": "2251137776008613104716473032292139194194282732130480744409917193732112429739"
}
```

## Libraries Used

- [@zk-kit/lean-imt](https://www.npmjs.com/package/@zk-kit/lean-imt): A library for Incremental Merkle Trees with support for Poseidon hash function. 