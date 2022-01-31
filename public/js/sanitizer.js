// Bug #1 credits: ~Giulio Furlan

// Funzione per sanificare il test inviato client-side
function sanitize(str){
    return String(str).replace(/[^\w. ]/gi, function(c){
        return "&#" + c.charCodeAt(0) + ";";
    });
}