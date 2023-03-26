export default {
  async fetch(request, env, ctx) {
    /**
     * Example someHost is set up to take in a JSON request
     * Replace url with the host you wish to send requests to
     * @param {string} someHost the host to send the request to
     * @param {string} url the URL to send the request to
     */
    const url = "https://api.openai.com/v1/chat/completions";

    /**
     * gatherResponse awaits and returns a response body as a string.
     * Use await gatherResponse(..) in an async function to get the response body
     * @param {Response} response
     */
    async function gatherResponse(response) {
      const { headers } = response;
      const contentType = headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return JSON.stringify(await response.json());
      }
      return response.text();
    }

    const query = new URL(request.url).search.slice(1).split('&');
    const queryParams = {};
    query.forEach(item => {
      const kv = item.split('=')
      queryParams[kv[0]] = kv[1];
    });
    
    let prompt = '';
    if (queryParams['prompt']) {
      prompt = queryParams['prompt'];
    } else {
      return new Response('No Prompt given');
    }

    const init = {
      method: 'POST',
      headers: {
        "user-agent": "Cloudflare Worker",
        "content-type": "application/json;charset=UTF-8",
        "authorization": `Bearer ${env.OpenAI_API_Key}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    };

    const response = await fetch(url, init);
    const results = await gatherResponse(response);
    console.log(results);
    const resultjson = JSON.parse(results).choices[0].message.content.trim();
    return new Response(resultjson);
  },
};
