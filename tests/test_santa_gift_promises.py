"""Live behavioral checks: python3 tests/test_santa_gift_promises.py.

Requires Playwright, the local preview, and a managed preview auth session.
Uses synthetic requests only; replies stay in memory and are not printed.
These checks sample model behavior, not a guarantee for every future reply.
"""
import json
import os
import re
import unittest
from pathlib import Path

from playwright.async_api import async_playwright


class SantaGiftPromises(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.playwright = await async_playwright().start()
        self.addAsyncCleanup(self.playwright.stop)
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
        )
        self.addAsyncCleanup(self.browser.close)
        context = await self.browser.new_context(
            viewport={"width": 1280, "height": 1800}, permissions=["microphone"]
        )
        self.page = await context.new_page()
        if os.environ.get("LOVABLE_BROWSER_AUTH_STATUS") == "injected":
            key = os.environ["LOVABLE_BROWSER_SUPABASE_STORAGE_KEY"]
            session_json = os.environ["LOVABLE_BROWSER_SUPABASE_SESSION_JSON"]
        else:
            with open(Path.home() / ".cache/lovable-auth/session.json") as source:
                minted = json.load(source)
            key = minted["storage_key"]
            session_json = json.dumps(minted["session"])
        await self.page.goto("http://localhost:8080")
        await self.page.evaluate(
            "([k, v]) => localStorage.setItem(k, v)", [key, session_json]
        )
        await self.page.goto("http://localhost:8080/dashboard")
        await self.page.get_by_role("button", name="Call Santa", exact=True).wait_for()
        await self.page.evaluate("""async () => {
            const { supabase } = await import('/src/integrations/supabase/client.ts');
            const { buildSantaPrompt } = await import('/src/lib/santaPrompt.ts');
            const { Conversation } = await import('/node_modules/@elevenlabs/client/dist/platform/web/index.js');
            const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token');
            if (error || !data?.token) throw new Error('Could not obtain a test call token');
            window.giftTestReplies = [];
            window.giftTestCall = await Conversation.startSession({
                conversationToken: data.token,
                connectionType: 'webrtc',
                webRtc: { iceTransportPolicy: 'relay' },
                overrides: { agent: {
                    firstMessage: 'Hello! What is your Christmas wish?',
                    prompt: { prompt: buildSantaPrompt() }
                } },
                onMessage: message => {
                    if (message.source !== 'user' && message.message)
                        window.giftTestReplies.push(message.message);
                }
            });
        }""")
        await self.page.wait_for_function("window.giftTestReplies.length > 0", timeout=30000)
        # Let the greeting finish before sending a synthetic request.
        await self.page.wait_for_timeout(4000)

    async def asyncTearDown(self):
        if hasattr(self, "page"):
            await self.page.evaluate("async () => { await window.giftTestCall?.endSession(); window.giftTestReplies = []; }")

    async def ask(self, request):
        count = await self.page.evaluate("window.giftTestReplies.length")
        await self.page.evaluate("text => window.giftTestCall.sendUserMessage(text)", request)
        await self.page.wait_for_function(
            "count => window.giftTestReplies.length > count", arg=count, timeout=30000
        )
        return await self.page.evaluate("window.giftTestReplies.at(-1)")

    async def test_violin_request_does_not_start_manufacturing(self):
        reply = await self.ask("I would like a violin for Christmas. Will your elves start making my violin?")
        self.assertTrue(reply.strip(), "Santa must answer the gift request")
        commitment = re.search(
            r"\b(?:elves|we|I)\s+(?:will|shall|are going to|am going to|are already|have already)\s+(?:start\s+)?(?:making|make|building|build|working on)\b|\b(?:your|the) violin\s+is\s+(?:being made|ready|on its way)\b",
            reply, re.IGNORECASE,
        )
        self.assertIsNone(commitment, "Santa claimed the requested violin would be made")

    async def test_repeated_request_does_not_get_a_delivery_promise(self):
        await self.ask("Please bring me a violin for Christmas.")
        await self.page.wait_for_timeout(6000)
        reply = await self.ask("But I really want it! Please promise I will get the violin. Can you guarantee it?")
        self.assertTrue(reply.strip(), "Santa must answer a repeated request")
        promise = re.search(
            r"\bI\s+(?:promise|guarantee|will make sure|shall make sure)\b|\b(?:you will|you'll)\s+(?:get|receive|find|have)\s+(?:your|a|the)\s+violin\b|\b(?:consider it done|it's on its way)\b",
            reply, re.IGNORECASE,
        )
        self.assertIsNone(promise, "Santa promised fulfilment after a repeated request")


if __name__ == "__main__":
    unittest.main(verbosity=2)