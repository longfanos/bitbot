package httpreq

// TODO: use this instead https://gowalker.org/github.com/parnurzeal/gorequest
// TODO: use map[string]interface{} for headers?

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func Get(url string, h http.Header, v interface{}) error {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}

	return doRequest(req, h, v)
}

func Post(url string, h http.Header, body string, v interface{}) error {
	b := bytes.NewReader([]byte(body))

	req, err := http.NewRequest("POST", url, b)
	if err != nil {
		return err
	}

	return doRequest(req, h, v)
}

func doRequest(req *http.Request, h http.Header, v interface{}) error {
	// TODO: add content-type json

	// TODO: make sure h doesn't not override content-type
	if h != nil {
		req.Header = h
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	// TODO: is it the right thing to do? How to handle 403 (like Hitbtc {"code":"NotAuthorized","message":"Wrong signature"})
	// or 522 (like CEX maintenance)
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		status := http.StatusText(resp.StatusCode)

		limit := 1000
		if len(respBody) <= limit {
			limit = len(respBody)
		}

		return fmt.Errorf("Request error: %s - %d %s\n%s", req.URL.String(), resp.StatusCode, status, respBody[:limit])
	}

	return json.Unmarshal(respBody, v)
}
