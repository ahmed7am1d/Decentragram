const { assert } = require("chai");

const Decentragram = artifacts.require("./Decentragram.sol");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Decentragram", ([deployer, author, tipper]) => {
  let decentragram;

  before(async () => {
    decentragram = await Decentragram.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = await decentragram.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      const name = await decentragram.name();
      assert.equal(name, "Decentragram");
    });
  });

  describe("images", async () => {
    let result, imageCount;
    const ipfsHash = "QmRAQB6YaCyidP37UdDnjFY5vQuiBrcqdyoW1CuDgwxkD4";

    before(async () => {
      result = await decentragram.uploadImage(ipfsHash, "Reddit comment", {
        from: author,
      });
      imageCount = await decentragram.imageCount();
    });

    //First test creating images 
    it("creates imRages", async () => {
      //SUCCESS
      console.log("#".repeat(50));
      const event = result.logs[0].args;
      assert.equal(imageCount, 1,'Image count starts with one');
      assert.equal(event.id.toNumber(),imageCount.toNumber(),'id is correct');
      assert.equal(event.hash, ipfsHash,'Hash is correct');
      assert.equal(event.description, 'Reddit comment','description is correct');
      assert.equal(event.tipAmount,'0','tip amount is correct');
      assert.equal(event.author,author,'author is correct');

      //FAILURE: Image must have hash
      await decentragram.uploadImage('','Reddit comment',{from:author}).should.be.rejected;

      //FAILURE: Image must have description 
      //we expect that the following code should be rejected if yes then all tests should be passed
      await decentragram.uploadImage('Image hash','',{from:author}).should.be.rejected;



    });

    //Second test listing images [Check from struct]
    //check from Struct
    it('lists images', async () => {
      const image = await decentragram.images(imageCount)
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(image.hash, ipfsHash, 'Hash is correct')
      assert.equal(image.description, 'Reddit comment', 'description is correct')
      assert.equal(image.tipAmount, '0', 'tip amount is correct')
      assert.equal(image.author, author, 'author is correct')
    })

    it('allows users to tip images', async () => {
      // Track the author balance before purchase
      let oldAuthorBalance;
      oldAuthorBalance = await web3.eth.getBalance(author);
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);

      result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') });

      // SUCCESS
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct');
      assert.equal(event.hash, ipfsHash, 'Hash is correct');
      assert.equal(event.description, 'Reddit comment', 'description is correct');
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct');
      assert.equal(event.author, author, 'author is correct');

      // Check that author received funds
      let newAuthorBalance;
      newAuthorBalance = await web3.eth.getBalance(author);
      newAuthorBalance = new web3.utils.BN(newAuthorBalance);

      let tipImageOwner
      tipImageOwner = web3.utils.toWei('1', 'Ether');
      tipImageOwner = new web3.utils.BN(tipImageOwner);

      const expectedBalance = oldAuthorBalance.add(tipImageOwner);

      assert.equal(newAuthorBalance.toString(), expectedBalance.toString());

      // FAILURE: Tries to tip a image that does not exist
      await decentragram.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })
  })
})