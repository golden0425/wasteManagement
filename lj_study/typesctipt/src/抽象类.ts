abstract class Animal {
    speak(){
        console.log("汪汪...");
    }
} 
class  Dog implements Animal {
    speak(): void {
        throw new Error("Method not implemented.");
    }
}