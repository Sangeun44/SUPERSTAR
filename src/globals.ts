
export var gl: WebGL2RenderingContext;
export function setGL(_gl: WebGL2RenderingContext) {
  gl = _gl;
}

export function readTextFile(file: string): string
{
    ///this is asynchronous
    var text = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    var isFinished = false;
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                text = allText;
            }
            isFinished = true;
        }
    }
    rawFile.send(null);
    while(!isFinished);
    return text;
}