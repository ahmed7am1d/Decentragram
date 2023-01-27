pragma solidity ^0.5.0;

contract Decentragram {
    string public name = "Decentragram";


    //Store images
    uint public imageCount = 0;
    //Store the hash of the ipfs on the blockchain
    mapping(uint => Image) public images;

    //basically this is our post
    struct Image {
        uint id;
        //ipfs location 
        string hash;
        //description of the post 
        string description;
        uint tipAmount;
        address payable author;
    }

    event ImageCreated(
        uint id,
        string hash,
        string description, 
        uint tipAmount,
        address payable author
    );

    event ImageTipped(
        uint id,
        string hash,
        string description,
        uint tipAmount,
        address payable author
    );

    //Create images
    function uploadImage(string memory _imgHash,string memory _description) public {
        //guards for the rest of the code

        //Make sure image description exists
        require(bytes(_description).length > 0);
        //Make sure image hash exists 
        require(bytes(_imgHash).length > 0);
        //Make sure uploader address exists
        require(msg.sender != address(0));

        //Increment image id
        imageCount++;
        //Add Image to contract
        //msg.sender => is the person who is calling this function (it represent the eth address of them)
        images[imageCount] = Image(imageCount,_imgHash,_description,0,msg.sender);
        //we use emit to see the data that is comming back
        emit ImageCreated(imageCount, _imgHash, _description, 0, msg.sender);
    }

    //Tip images
    //payable => because cryptocurrency will be sent with this function
    function tipImageOwner(uint _id) public payable{
            //Make sure the id is valid 
            require(_id > 0 && _id <= imageCount);
            //Fetch the image 
            Image memory _image = images[_id];
            //Fetch the author
            address payable _author = _image.author;
            //Pay the author by sending them Ether
            address(_author).transfer(msg.value);
            //Increment the tip amount 
            _image.tipAmount = _image.tipAmount + msg.value;
            //Update the images
            images[_id] = _image;
            //Trigger an event
            emit ImageTipped(_id,_image.hash,_image.description,_image.tipAmount,_author);
    }
}
