const q = <T>(query: string) => document.querySelector(query) as T
const on = (e: HTMLElement) => e.classList.add('on')
const off = (e: HTMLElement) => e.classList.remove('on')

const fileInput = q<HTMLInputElement>('#file')
fileInput.addEventListener('input', function(ev) {
    if(this.files && this.files.length >= 1) {
        const blob = this.files[0];
        const url = URL.createObjectURL(blob);

        const placeholder = q<HTMLImageElement>('label[for="file"] > img.placeholder');
        const preview = q<HTMLImageElement>('label[for="file"] > img.preview');
        off(placeholder)
        preview.src = url;
        on(preview)
    }
})

const legofy = q<HTMLDivElement>('div.interaction > div.legofy')
legofy.addEventListener('click', async () => {
    if(fileInput.files && fileInput.files.length >= 1) {
        const loader = q<HTMLDivElement>('div.interaction div.legofy > div')
        const button = q<HTMLSpanElement>('div.interaction div.legofy > span')
        off(button)
        on(loader)
        
        fileInput.disabled = true
        const file = fileInput.files[0]
        const brickInput = q<HTMLInputElement>('div.interaction > input')
        const brickSize = parseInt(brickInput.value) || 50

        const url = new URL(`/legofy/${brickSize}`, window.location.origin,)
        const response = await fetch(url, {
                method: "POST",
                body: file
            }
        )

        off(loader)
        on(button)
        if(response.status !== 200) {
            const placeholder = q<HTMLImageElement>('label[for="file"] > img.placeholder');
            const preview = q<HTMLImageElement>('label[for="file"] > img.preview');
            placeholder.classList.add('on');
            on(placeholder)
            off(preview)
            return
        }

        const blob = await response.blob()

        const left = q<HTMLImageElement>('section.output > div.left img')
        const right = q<HTMLImageElement>('section.output > div.right img') 
        const download = q<HTMLLinkElement>('section.output > div.right a') 

        left.src = URL.createObjectURL(file)
        right.src = URL.createObjectURL(blob)
        
        // @ts-ignore
        download.download = `${file.name.split('.').at(0)}.lego.png`
        // @ts-ignore
        download.src = right.src
        
        fileInput.disabled = false

        const input = q<HTMLElement>('section.input')
        const output = q<HTMLElement>('section.output')
        off(input)
        on(output)
    }
})