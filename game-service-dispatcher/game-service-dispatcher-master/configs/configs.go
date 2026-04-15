package config

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

type Config struct {
	HostConfig     *HostConfig     `json:"host"`
	DatabaseConfig *DatabaseConfig `json:"database"`
}

type HostConfig struct {
	ApiPort  int    `json:"apiPort"`
	DispPort int    `json:"dispPort"`
	RoomPort int    `json:"roomPort"`
	BaseHost string `json:"baseHost"`
	CdnHost  string `json:"cdnHost"`
	DispHost string `json:"dispHost"`
	GameHost string `json:"gameHost"`
	GamePort int    `json:"gamePort"`
}

type DatabaseConfig struct {
	LocalPath string        `json:"localPath"`
	Storage   string        `json:"storage"`
	Mariadb   MariadbConfig `json:"mariadb"`
	Redis     RedisConfig   `json:"redis"`
}

type MariadbConfig struct {
	Host            string `json:"host"`
	Port            int    `json:"port"`
	User            string `json:"user"`
	Password        string `json:"password"`
	Database        string `json:"database"`
	ConnectionLimit int    `json:"connectionLimit"`
}

type RedisConfig struct {
	Username string      `json:"username"`
	Password string      `json:"password"`
	Socket   RedisSocket `json:"socket"`
}

type RedisSocket struct {
	Host string `json:"host"`
	Port int    `json:"port"`
}

func LoadConfig() (*Config, error) {
	config := &Config{}

	if err := loadConfigFile("configs/host.json", &config.HostConfig); err != nil {
		return nil, err
	}

	if err := loadConfigFile("configs/database.json", &config.DatabaseConfig); err != nil {
		return nil, err
	}

	return config, nil
}

func loadConfigFile(filename string, config interface{}) error {
	file, err := os.Open(filename)

	if err != nil {
		return fmt.Errorf("could not open file %s: %v", filename, err)
	}
	defer file.Close()

	bytes, err := io.ReadAll(file)
	if err != nil {
		return fmt.Errorf("could not read file %s: %v", filename, err)
	}

	if err := json.Unmarshal(bytes, config); err != nil {
		return fmt.Errorf("could not unmarshal file %s: %v", filename, err)
	}

	return nil
}
