
const readline = require("readline-sync");

class ContaBancaria {
    static contadorContas = 1000;

    constructor(titular, senha) {
        this.titular = titular;
        this.#senha = senha;
        this.numeroConta = ContaBancaria.contadorContas++;
        this.#saldo = 0;
        this.extrato = [];
    }

    #saldo;
    #senha;

    autenticar(senha) {
        return this.#senha === senha;
    }

    depositar(valor) {
        if (valor > 0) {
            this.#saldo += valor;
            this.extrato.push(`Depósito: +R$${valor.toFixed(2)}`);
            console.log(`${this.titular}: Depósito de R$${valor.toFixed(2)} realizado.`);
        } else {
            console.log("Valor inválido para depósito.");
        }
    }

    sacar(valor) {
        if (valor > 0 && valor <= this.#saldo) {
            this.#saldo -= valor;
            this.extrato.push(`Saque: -R$${valor.toFixed(2)}`);
            console.log(`${this.titular}: Saque de R$${valor.toFixed(2)} realizado.`);
        } else {
            console.log("Saldo insuficiente para saque.");
        }
    }

    consultarSaldo() {
        console.log(`${this.titular}: Saldo atual é R$${this.#saldo.toFixed(2)}`);
        return this.#saldo;
    }

    verExtrato() {
        console.log(`Extrato de ${this.titular}:`);
        this.extrato.forEach(op => console.log(op));
    }

    transferir(valor, destino) {
        if (valor > 0 && valor <= this.#saldo) {
            this.#saldo -= valor;
            destino.depositar(valor);
            this.extrato.push(`Transferência: -R$${valor.toFixed(2)} para ${destino.titular}`);
            console.log(`Transferência de R$${valor.toFixed(2)} realizada para ${destino.titular}.`);
        } else {
            console.log("Transferência não realizada. Saldo insuficiente.");
        }
    }

    emprestimo(valor, taxa = 0.05) {
        if (valor > 0) {
            const juros = valor * taxa;
            const total = valor + juros;
            this.#saldo += valor;
            this.extrato.push(`Empréstimo: +R$${valor.toFixed(2)} (Total a pagar: R$${total.toFixed(2)})`);
            console.log(`Empréstimo de R$${valor.toFixed(2)} concedido com juros de ${taxa * 100}%`);
        }
    }

    aplicarRendimento(mensal = 0.005) {
        const rendimento = this.#saldo * mensal;
        this.#saldo += rendimento;
        this.extrato.push(`Rendimento mensal: +R$${rendimento.toFixed(2)}`);
        console.log(`${this.titular}: Rendimento de R$${rendimento.toFixed(2)} aplicado.`);
    }
}

class ContaCorrente extends ContaBancaria {
    constructor(titular, senha, limite = 500) {
        super(titular, senha);
        this.limite = limite;
    }

    sacar(valor) {
        const saldoAtual = this.consultarSaldo();
        if (valor > 0 && valor <= saldoAtual + this.limite) {
            super.depositar(-valor);
            this.extrato.push(`Saque (com limite): -R$${valor.toFixed(2)}`);
            console.log(`${this.titular}: Saque com limite de R$${valor.toFixed(2)} realizado.`);
        } else {
            console.log("Limite insuficiente para saque.");
        }
    }
}

class ContaPoupanca extends ContaBancaria {
    sacar(valor) {
        const saldoAtual = this.consultarSaldo();
        if (valor > 0 && valor <= saldoAtual) {
            super.depositar(-valor);
            this.extrato.push(`Saque: -R$${valor.toFixed(2)}`);
            console.log(`${this.titular}: Saque de R$${valor.toFixed(2)} realizado.`);
        } else {
            console.log("Saque não permitido. Saldo insuficiente.");
        }
    }
}

class Agencia {
    constructor(nome) {
        this.nome = nome;
        this.contas = [];
    }

    adicionarConta(conta) {
        this.contas.push(conta);
    }

    listarContas() {
        console.log(`Contas da Agência ${this.nome}:`);
        this.contas.forEach(conta => {
            console.log(`Titular: ${conta.titular}, Nº: ${conta.numeroConta}`);
        });
    }

    encontrarContaPorNumero(numero) {
        return this.contas.find(conta => conta.numeroConta === numero);
    }
}

// ========== SIMULAÇÃO E MENU ==========

const agencia = new Agencia("Agência Central");

// Criar algumas contas para teste
const conta1 = new ContaCorrente("Alice", "1234");
const conta2 = new ContaPoupanca("Bruno", "4321");
agencia.adicionarConta(conta1);
agencia.adicionarConta(conta2);

// Menu interativo com autenticação
while (true) {
    console.log("\n=== Bem-vindo ao Banco ===");
    const numConta = parseInt(readline.question("Digite o número da conta (ou 0 para sair): "));
    if (numConta === 0) break;

    const conta = agencia.encontrarContaPorNumero(numConta);
    if (!conta) {
        console.log("Conta não encontrada.");
        continue;
    }

    const senha = readline.question("Digite a senha: ");
    if (!conta.autenticar(senha)) {
        console.log("Senha incorreta.");
        continue;
    }

    let opcao;
    do {
        console.log(`\nBem-vindo(a), ${conta.titular}`);
        console.log("1. Consultar saldo");
        console.log("2. Depositar");
        console.log("3. Sacar");
        console.log("4. Ver extrato");
        console.log("5. Transferir");
        console.log("6. Solicitar empréstimo");
        console.log("7. Aplicar rendimento (poupança)");
        console.log("8. Sair");
        opcao = readline.question("Escolha uma opção: ");

        switch (opcao) {
            case "1":
                conta.consultarSaldo();
                break;
            case "2":
                const valorDep = parseFloat(readline.question("Valor para depósito: "));
                conta.depositar(valorDep);
                break;
            case "3":
                const valorSaq = parseFloat(readline.question("Valor para saque: "));
                conta.sacar(valorSaq);
                break;
            case "4":
                conta.verExtrato();
                break;
            case "5":
                const numeroDestino = parseInt(readline.question("Número da conta de destino: "));
                const contaDestino = agencia.encontrarContaPorNumero(numeroDestino);
                if (contaDestino) {
                    const valorTransf = parseFloat(readline.question("Valor para transferir: "));
                    conta.transferir(valorTransf, contaDestino);
                } else {
                    console.log("Conta de destino não encontrada.");
                }
                break;
            case "6":
                const valorEmprestimo = parseFloat(readline.question("Valor do empréstimo: "));
                conta.emprestimo(valorEmprestimo);
                break;
            case "7":
                if (conta instanceof ContaPoupanca) {
                    conta.aplicarRendimento();
                } else {
                    console.log("Rendimento só está disponível para conta poupança.");
                }
                break;
            case "8":
                console.log("Saindo...");
                break;
            default:
                console.log("Opção inválida.");
        }
    } while (opcao !== "8");
}