package main

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/btcsuite/btcd/chaincfg"
	"github.com/btcsuite/btcutil/hdkeychain"
	"github.com/lightningnetwork/lnd/keychain"
)

const (
	HardenedKeyStart            = uint32(hdkeychain.HardenedKeyStart)
	WalletDefaultDerivationPath = "m/84'/0'/0'"
	LndDerivationPath           = "m/1017'/%d'/%d'"
)

func DeriveChildren(key *hdkeychain.ExtendedKey, path []uint32) (
	*hdkeychain.ExtendedKey, error) {

	var (
		currentKey = key
		err        error
	)
	for _, pathPart := range path {
		currentKey, err = currentKey.Derive(pathPart)
		if err != nil {
			return nil, err
		}
	}
	return currentKey, nil
}

func ParsePath(path string) ([]uint32, error) {
	path = strings.TrimSpace(path)
	if len(path) == 0 {
		return nil, fmt.Errorf("path cannot be empty")
	}
	if !strings.HasPrefix(path, "m/") {
		return nil, fmt.Errorf("path must start with m/")
	}
	parts := strings.Split(path, "/")
	indices := make([]uint32, len(parts)-1)
	for i := 1; i < len(parts); i++ {
		index := uint32(0)
		part := parts[i]
		if strings.Contains(parts[i], "'") {
			index += HardenedKeyStart
			part = strings.TrimRight(parts[i], "'")
		}
		parsed, err := strconv.Atoi(part)
		if err != nil {
			return nil, fmt.Errorf("could not parse part \"%s\": "+
				"%v", part, err)
		}
		indices[i-1] = index + uint32(parsed)
	}
	return indices, nil
}

func IdentityPath(params *chaincfg.Params) string {
	return fmt.Sprintf(
		LndDerivationPath+"/0/0", params.HDCoinType,
		keychain.KeyFamilyNodeKey,
	)
}

func WalletPath(params *chaincfg.Params, index int) string {
	return fmt.Sprintf(WalletDefaultDerivationPath+"/0/%d", index)
}
