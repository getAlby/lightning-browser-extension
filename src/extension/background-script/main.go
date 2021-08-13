//+ build js,wasm

package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"os"
	"strings"
	"syscall/js"
	"time"

	"github.com/btcsuite/btcutil/psbt"
	flags "github.com/jessevdk/go-flags"

	"github.com/lianghx-319/go-wasm-loader/gobridge"

	"github.com/btcsuite/btcd/chaincfg"
	"github.com/btcsuite/btcutil"
	"github.com/btcsuite/btcutil/hdkeychain"
	"github.com/lightningnetwork/lnd/aezeed"
	"github.com/lightningnetwork/lnd/zpay32"
)

var (
	global      = js.Global()
	chainParams = &chaincfg.MainNetParams
)

func add(this js.Value, args []js.Value) (interface{}, error) {

	invoice := args[0].String()
	return invoice, nil
	return "ret", nil
}

func err(this js.Value, args []js.Value) (interface{}, error) {
	return nil, errors.New("This is an error")
}

func main() {
	cfg := config{}

	// Parse command line flags.
	parser := flags.NewParser(&cfg, flags.Default)
	parser.SubcommandsOptional = true

	_, err := parser.Parse()
	if e, ok := err.(*flags.Error); ok && e.Type == flags.ErrHelp {
		exit(err)
	}
	if err != nil {
		exit(err)
	}

	c := make(chan struct{}, 0)
	println("Web Assembly is ready")
	gobridge.RegisterCallback("add", add)
	gobridge.RegisterValue("someValue", "Hello World")

	gobridge.RegisterCallback("ddemoDecodeInvoice", decodeInvoice)
	//gobridge.RegisterCallback("demoGenerateAezeed", generateAezeed)
	//gobridge.RegisterCallback("demoDecodePsbt", decodePsbt)

	<-c
}

func decodeInvoice(this js.Value, args []js.Value) (interface{}, error) {
	invoiceStr := args[0].String()
	//invoiceStr := "lnbc1500n1pssc9wkpp5x3p7cys9vk6pfvsrl9flraasny304uqfjhut00hqgvp9v42u42eqdpa2fjkzep6ypyx7aeqw3hjqsmfwf3h2mrpwgs9yetzv9kxzmnrv5s8wteqgfskccqzpgxqr23ssp5vw3llna7c9xngl5wwfflr6czn39t39ks8czkv7hfju2vs2u2ce8s9qyyssq5zgr9khymuqgkxuwz0ulreth0kxdreewmmuvvw2kn74a8xdfelsk9q5z5fnxy2rkdpwyldxnkse5pmfpxsdvfw6m7ffstzhf4ahzhjgqm6avmd"

	//log.Infof("Decoding invoice %s", invoiceStr)
	invoice, err := zpay32.Decode(invoiceStr, chainParams)
	if err != nil {
		return nil, err
	}

	invoiceJSON, err := json.Marshal(invoice)
	if err != nil {
		return nil, err
	}

	return string(invoiceJSON), nil
}

func generateAezeed(_ js.Value, _ []js.Value) interface{} {
	log.Infof("Generating aezeed")

	var entropy [16]byte
	_, err := rand.Read(entropy[:])
	if err != nil {
		return js.ValueOf(err.Error())
	}

	seed, err := aezeed.New(aezeed.CipherSeedVersion, &entropy, time.Now())
	if err != nil {
		return js.ValueOf(err.Error())
	}

	mnemonic, err := seed.ToMnemonic(nil)
	if err != nil {
		return js.ValueOf(err.Error())
	}

	extendedKey, err := hdkeychain.NewMaster(entropy[:], chainParams)
	if err != nil {
		return js.ValueOf(err.Error())
	}

	nodePath, err := ParsePath(IdentityPath(chainParams))
	if err != nil {
		return js.ValueOf(err.Error())
	}

	nodeKey, err := DeriveChildren(extendedKey, nodePath)
	if err != nil {
		return js.ValueOf(err.Error())
	}

	nodePubKey, err := nodeKey.ECPubKey()
	if err != nil {
		return js.ValueOf(err.Error())
	}

	addrPath, err := ParsePath(WalletPath(chainParams, 0))
	if err != nil {
		return js.ValueOf(err.Error())
	}

	addrKey, err := DeriveChildren(extendedKey, addrPath)
	if err != nil {
		return js.ValueOf(err.Error())
	}

	addrPubkey, err := addrKey.ECPubKey()
	if err != nil {
		return js.ValueOf(err.Error())
	}
	hash160 := btcutil.Hash160(addrPubkey.SerializeCompressed())
	addrP2WKH, err := btcutil.NewAddressWitnessPubKeyHash(
		hash160, chainParams,
	)
	if err != nil {
		return js.ValueOf(err.Error())
	}

	return js.ValueOf(`
	aezeed:		` + strings.Join(mnemonic[:], " ") + `
	xprv:		` + extendedKey.String() + `
	node ID: 	` + hex.EncodeToString(nodePubKey.SerializeCompressed()) + `
	first address: 	` + addrP2WKH.EncodeAddress())
}

func decodePsbt(_ js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return js.ValueOf("invalid use of decodePsbt, " +
			"need 1 parameter: psbt")
	}

	psbtStr := args[0].String()

	log.Infof("Decoding PSBT %s", psbtStr)
	packet, err := psbt.NewFromRawBytes(strings.NewReader(psbtStr), true)
	if err != nil {
		return js.ValueOf(err.Error())
	}

	packetJSON, err := json.Marshal(packet)
	if err != nil {
		return js.ValueOf(err.Error())
	}

	return js.ValueOf(string(packetJSON))
}

func exit(err error) {
	log.Debugf("Error running wasm client: %v", err)
	os.Exit(1)
}
