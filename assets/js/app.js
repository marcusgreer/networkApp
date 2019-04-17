var messageCount = -1;
(function(){
            var element = function(id){
                return document.getElementById(id);
            }

            // Get Elements
            var status = element('status');
            var messages = element('messages');
            var textarea = element('textarea');
            var username = element('username');
            var clearBtn = element('clear');

            // Set default status
            var statusDefault = status.textContent;

            var setStatus = function(s){
                // Set status
                status.textContent = s;

                if(s !== statusDefault){
                    var delay = setTimeout(function(){
                        setStatus(statusDefault);
                    }, 4000);
                }
            }

            var newPrompt = function() { 
                return "let's talk about ";
            }

            var scoreAnswer = function(prompt, sentence) {

                var r = new RiString(textarea.value);
                console.log(r);
                return Math.floor(Math.random() * 10);
            }


            // Connect to socket.io
            var socket = io.connect('http://127.0.0.1:8080');

            // Check for connection
            if(socket !== undefined){
                console.log('Connected to socket...');


                // Handle Output
                socket.on('output', function(data){
                    //console.log(data);
                    if(data.length){
                        for(var x = 0;x < data.length;x++){
                            // Build out message div
                            var message = document.createElement('div');
                            message.setAttribute('class', 'chat-message');
                            message.textContent = data[x].name+": "+data[x].message;
                            messages.appendChild(message);
                            messages.scrollTop = messages.scrollHeight;
                        } 
                    }
                });

                // Get Status From Server
                socket.on('status', function(data){
                    // get message status
                    setStatus((typeof data === 'object')? data.message : data);

                    // If status is clear, clear text
                    if(data.clear){
                        textarea.value = '';
                    }
                });

                socket.on('messageID', function(data){
                    if (data != 0 && data%10 == 0) {
                        socket.emit('input', {
                            name:"ROBOT",
                            message:"NEW PROMPT",
                            score:-1
                        });
                    }
                })

                // Handle Input
                textarea.addEventListener('keydown', function(event){
                    
                    if(event.which === 13 && event.shiftKey == false){
                        // Emit to server input
                        socket.emit('input', {
                            name:username.value,
                            message:textarea.value,
                            score:scoreAnswer("", textarea.value)
                        });
                        event.preventDefault();
                    } 
                    
                })


                // Handle Chat Clear
                clearBtn.addEventListener('click', function(){
                    socket.emit('clear');
                });

                // Clear Message
                socket.on('cleared', function(){
                    messages.textContent = '';
                    messageCount = 0;
                });
            }

        })();