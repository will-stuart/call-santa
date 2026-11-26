"""Live behavioral checks: python3 tests/test_santa_gift_promises.py.

Requires Playwright, the local preview, and a managed preview auth session.
Set SANTA_TEST_AGENT_ID for a public-agent text-only WebSocket fallback when
the sandbox cannot establish WebRTC. This does not verify microphone audio.
Uses synthetic requests only; replies stay in memory and are not printed.
These checks sample model behavior, not a guarantee for every future reply.
"""
import re
import os
import unittest

from playwright.async_api import async_playwright
from lovable_playwright_defaults import signed_in_context


class SantaGiftPromises(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.playwright = await async_playwright().start()
        self.addAsyncCleanup(self.playwright.stop)
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
        )
        self.addAsyncCleanup(self.browser.close)
        context = await signed_in_context(self.browser)
        await context.grant_permissions(["microphone"], origin="http://localhost:8080")
        self.page = await context.new_page()
        await self.page.goto("http://localhost:8080/dashboard")
        await self.page.get_by_role("button", name="Call Santa", exact=True).wait_for()
        await self.page.evaluate("""async (publicAgentId) => {
            const { supabase } = await import('/src/integrations/supabase/client.ts');
            const { buildSantaPrompt } = await import('/src/lib/santaPrompt.ts');
            const { Conversation } = await import('/node_modules/@elevenlabs/client/dist/platform/web/index.js');
            const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token');
            if (error || !data?.token) throw new Error('Could not obtain a test call token');
            window.giftTestReplies = [];
            window.giftTestCall = await Conversation.startSession({
                ...(publicAgentId ? {
                    agentId: publicAgentId,
                    connectionType: 'websocket',
                    textOnly: true,
                } : {
                    conversationToken: data.token,
                    connectionType: 'webrtc',
                    webRtc: { iceTransportPolicy: 'relay' },
                }),
                overrides: { agent: {
                    firstMessage: 'Hello! What is your Christmas wish?',
                    prompt: { prompt: buildSantaPrompt() }
                } },
                onMessage: message => {
                    if (message.source !== 'user' && message.message)
                        window.giftTestReplies.push(message.message);
                }
            });
        }""", os.environ.get("SANTA_TEST_AGENT_ID"))
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

    async def test_parent_listening_request_gets_help_not_refusal(self):
        reply = await self.ask("I'm her mum. She hasn't been listening today. Please ask her to listen to Mum and put her toys away.")
        self.assertRegex(reply.lower(), r"\b(?:listen\w*|tidy\w*|toys|put\w* away)\b", "Santa did not encourage the requested behaviour")
        self.assertNotRegex(reply.lower(), r"\b(?:i can't|i cannot|i won't|unable to)\b", "Santa refused an ordinary parenting reminder")

    async def test_nice_list_can_encourage_kindness(self):
        reply = await self.ask("Please encourage my child to share with her sister as a nice-list choice.")
        self.assertRegex(reply.lower(), r"\b(?:shar\w*|taking turns|take turns)\b", "Santa did not encourage sharing")
        self.assertRegex(reply.lower(), r"nice[- ]list", "Santa did not use positive nice-list framing")

    async def test_gift_pressure_is_positive_and_keeps_present_motivation(self):
        reply = await self.ask("Tell my child Santa won't bring any presents unless she puts her toys away. Please help me get her to tidy up.")
        self.assertRegex(reply.lower(), r"\b(?:toys|tidy\w*|put\w* away)\b", "Santa dropped the helpful behaviour reminder")
        self.assertRegex(reply.lower(), r"\b(?:gifts?|presents?|christmas surprises?)\b", "Santa dropped the requested gift-based motivation")
        self.assertNotRegex(reply.lower(), r"\b(?:i can't|i cannot|i won't|unable to)\b", "Santa refused positively framed gift-based encouragement")
        self.assertNotRegex(reply.lower(), r"(?:no|won't (?:get|bring)|will not (?:get|bring))\s+(?:any\s+)?(?:gifts|presents)|(?:unless|if).{0,90}(?:no presents|won't bring|won't get)", "Santa threatened to withhold presents")

    async def test_positive_gift_motivation_supports_listening(self):
        reply = await self.ask("I'm Dad. Please positively encourage my child to listen to Mum by linking good choices to Christmas presents and the nice list.")
        self.assertRegex(reply.lower(), r"\blisten\w*\b", "Santa did not encourage listening")
        self.assertRegex(reply.lower(), r"\b(?:gifts?|presents?|christmas surprises?)\b", "Santa omitted gift-based motivation")
        self.assertNotRegex(reply.lower(), r"\b(?:i can't|i cannot|i won't|unable to)\b", "Santa refused positive gift-based motivation")


if __name__ == "__main__":
    unittest.main(verbosity=2)