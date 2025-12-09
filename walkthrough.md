# SelfDraw - Walkthrough & Verification

## 1. Local Setup
- Run `start.bat` to launch the local server.
- Access the app at `http://localhost:8888`.

## 2. Privacy Verification
- **Requirement**: Chat history must NOT be saved.
- **Test**: Send messages in the chat. Check your MongoDB `chats` collection. It should NOT receive new entries.
- **Test**: Complete a test form. Check MongoDB `test_results`. It SHOULD receive the entry.

## 3. Interaction Flow Verification

### Phase 0: Intro & Anamnesis
1. Say "Hola".
2. Agent should ask 3 specific questions (Reason, Impact, Expectation) one by one.
3. Answer them.

### Phase 1: Measurement (The Test)
1. Agent should introduce the test **with context** (e.g., "Entiendo que te sientes...").
2. **Verify**: The test form should appear **AFTER** the agent's message, not replacing it.
3. Fill and submit the test.

### Phase 2: Intervention (Canvas)
1. Agent should diagnose and activate Canvas.
2. **Verify**: Background should show **vibrant, animated blobs** moving fluidly (not static).
3. **Verify**: The movement should be organic (wavy/floating) and faster than before.
4. **Verify**: The colors should be distinct and vibrant (e.g., bright Blue/Cyan for Anxiety).
5. **Verify**: Color palette should have 4 specific colors related to the emotion.
6. Draw something.

### Phase 3: Checkout & Reflection
1. Click "Terminar Dibujo".
2. **Verify**: Layout changes, palette removed.
3. Explain your drawing.

### Phase 4: Re-evaluation (Optional)
1. Agent should **ASK** if you want to take the test again.
2. Say "Sí".
3. **Verify**: The test form appears.
4. Submit and finish.
