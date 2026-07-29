// Initialize Lucide Icons
lucide.createIcons();

const chatMessages = document.getElementById("chat-messages");
const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

const userId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

const loading = document.createElement('div');
loading.className = 'my-6 animate-pulse';
loading.textContent = 'Thinking...'
// Function to add a user message to the DOM
function addUserMessage(text) {
    const userDiv = document.createElement("div");
    userDiv.className = "flex justify-end";
    userDiv.innerHTML = `
    <div class="bg-[#1e293b] text-white px-5 py-2.5 rounded-3xl max-w-[80%] text-[15px]">
      ${text}
    </div>
  `;
    chatMessages.appendChild(userDiv);
    chatMessages.appendChild(loading);
    callServer(text);
   
   
}

// Function to add a simulated LLM response
async function addLLMResponse(text) {

    const llmDiv = document.createElement("div");
    llmDiv.className = "flex flex-col gap-3 text-[15px] leading-relaxed text-slate-200";
    llmDiv.innerHTML = `
    <p>${text}</p>
    <div class="flex items-center gap-2 pt-1 text-slate-400">
      <button class="p-1.5 hover:text-white hover:bg-[#1e293b] rounded-md transition"><i data-lucide="copy" class="w-4 h-4"></i></button>
      <button class="p-1.5 hover:text-white hover:bg-[#1e293b] rounded-md transition"><i data-lucide="thumbs-up" class="w-4 h-4"></i></button>
      <button class="p-1.5 hover:text-white hover:bg-[#1e293b] rounded-md transition"><i data-lucide="thumbs-down" class="w-4 h-4"></i></button>
      <button class="p-1.5 hover:text-white hover:bg-[#1e293b] rounded-md transition"><i data-lucide="share" class="w-4 h-4"></i></button>
    </div>
  `;
    chatMessages.appendChild(llmDiv);
    loading.remove();
    lucide.createIcons(); // Refresh dynamic icons
}

// Function to send message
function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add User Message
    addUserMessage(message);
    userInput.value = "";

    // Auto-scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Simulate LLM Reply
    
}

// Event Listeners
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function callServer(userText) {
    const response = await fetch('https://agenticsearch-node-1.onrender.com/chat', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ message: userText, userId: userId }),
    });

    if (!response.ok) {
        throw new error("Respos=nse generated Error!!");
    }

    const result = await response.json()
    console.log("result:"+result);
    console.log("result.message:"+result.message);
    
    setTimeout(() => {
        addLLMResponse(result.message);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 600);
    
    return result.message;

}
