module mint_nft::minting {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_token_objects::aptos_token;
    use aptos_framework::event::{EventHandle};
    use aptos_framework::aptos_account;

    const COLLECTION_NAME : vector<u8> = b"Ninja Aptos NFT";
    const COLLECTION_DESCRIPTION : vector<u8> = b"This is a devnet NFT collection.";
    const COLLECTION_URI : vector<u8> = b"Ninja Uri";

    struct CollectionCreator has key {
        extend_ref: ExtendRef,
        token_minting_events: EventHandle<TokenMintingEvent>,
        current_supply: u64,
        maximum_supply: u64,
        token_uri_prefix: String,
        file_extension: String,
        public_price: u64
    }

    struct TokenMintingEvent has drop, store {
        token_receiver_address: address,
        token_name: String,
    }

    fun init_module(deployer: &signer) {
        let creator_object_ref = &object::create_object(@mint_nft);
        let extend_ref = object::generate_extend_ref(creator_object_ref);
        let creator_signer = &object::generate_signer(creator_object_ref);

        aptos_token::create_collection(
            creator_signer,
            string::utf8(COLLECTION_DESCRIPTION),
            1000,
            string::utf8(COLLECTION_NAME),
            string::utf8(COLLECTION_URI),
            true, true, true, true, true, true, true, true, true,
            5,
            100
        );

        move_to(deployer, CollectionCreator {
            extend_ref,
            token_minting_events: aptos_framework::account::new_event_handle<TokenMintingEvent>(deployer),
            current_supply: 0,
            maximum_supply: 100,
            token_uri_prefix: string::utf8(b"https://testninja.com/"),
            file_extension: string::utf8(b".json"),
            public_price: 101100000
        });
    }

    public entry fun mint_token(minter: &signer, quantity: u64) acquires CollectionCreator {
        let minter_addr = signer::address_of(minter);
        let creator_data = borrow_global_mut<CollectionCreator>(@mint_nft);

        assert!(creator_data.current_supply + quantity <= creator_data.maximum_supply, 1);

        let mint_fee = creator_data.public_price;

        let _totalfee: u64 = mint_fee * quantity;

        aptos_account::transfer(minter, @mint_nft, _totalfee);

        let extend_ref = &creator_data.extend_ref;
        let creator_signer = &object::generate_signer_for_extending(extend_ref);

        let token_id_str = to_string(creator_data.current_supply + 1);

        let token_name = string::utf8(b"NINJA #");
        string::append(&mut token_name, token_id_str);

        let token_uri = creator_data.token_uri_prefix;
        string::append(&mut token_uri, token_id_str);
        string::append(&mut token_uri, creator_data.file_extension);

        let nft = aptos_token::mint_token_object(
            creator_signer,
            string::utf8(COLLECTION_NAME),
            string::utf8(COLLECTION_DESCRIPTION),
            token_name,
            token_uri,
            vector[],
            vector[],
            vector[],
        );

        object::transfer(creator_signer, nft, minter_addr);

        aptos_framework::event::emit_event<TokenMintingEvent>(
            &mut creator_data.token_minting_events,
            TokenMintingEvent {
                token_receiver_address: minter_addr,
                token_name,
            }
        );

        creator_data.current_supply = creator_data.current_supply + 1;
    }

    fun to_string(value: u64): String {
        if (value == 0) {
            return string::utf8(b"0");
        };
        let buffer = vector::empty<u8>();
        let mut_val = value;
        while (mut_val > 0) {
            vector::push_back(&mut buffer, ((48 + mut_val % 10) as u8));
            mut_val = mut_val / 10;
        };
        vector::reverse(&mut buffer);
        string::utf8(buffer)
    }

    #[test(deployer=@mint_nft, minter=@0x123)]
    fun test_function(deployer: signer, minter: signer) acquires CollectionCreator {
        init_module(&deployer);
        mint_token(&minter);
    }
}
