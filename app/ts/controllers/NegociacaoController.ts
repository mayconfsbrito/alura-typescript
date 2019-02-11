import { NegociacoesView, MensagemView } from '../views/index';
import { Negociacoes, Negociacao } from './../models/index';
import { domInject, throttle } from './../helpers/decorators/index';
import { NegociacaoService } from './../services/index';
import { imprime } from './../helpers/index';

export class NegociacaoController {

    @domInject("#data")
    private _inputData: JQuery;

    @domInject("#quantidade")
    private _inputQuantidade: JQuery;

    @domInject("#valor")
    private _inputValor: JQuery;

    private _negociacoes = new Negociacoes();
    private _negociacoesView = new NegociacoesView("#negociacoesView");
    private _mensagemView = new MensagemView("#mensagemView");
    private _negociacaoService = new NegociacaoService();

    constructor() {
        this._negociacoesView.update(this._negociacoes);
    }

    @throttle(500)
    public adiciona(): void {
        
        let data = new Date(this._inputData.val().replace(/-/g, ','));

        if (!this._ehDiaUtil(data)) {
            this._mensagemView.update("Somente negociações em dias úteis, por favor.");
            return;
        }

        const negociacao = new Negociacao(
            data,
            parseInt(this._inputQuantidade.val()),
            parseFloat(this._inputValor.val())
        );

        imprime(negociacao, this._negociacoes);
        
        this._negociacoes.adiciona(negociacao);
        this._negociacoesView.update(this._negociacoes);
        this._mensagemView.update("Negociação adicionada com sucesso!");
    }

    @throttle(500)
    public async importarDados() {

        try {
            const negociacoesParaImportar = await this._negociacaoService
                .obterNegociacoes(res => {
                    if (res.ok) {
                        return res;
                    } else {
                        throw new Error(res.statusText);
                    }
                })
            const negociacoesJaImportadas = this._negociacoes.paraArray();

            negociacoesParaImportar
                .filter((negociacao: Negociacao) =>
                    !negociacoesJaImportadas.some(jaImportada =>
                        negociacao.ehIgual(jaImportada)))
                .forEach((negociacao: Negociacao) =>
                    this._negociacoes.adiciona(negociacao));

            this._negociacoesView.update(this._negociacoes);
        } catch(err) {
            this._negociacoesView.update(err.message);
        }
    }

    private _ehDiaUtil(data: Date) {
        return data.getDay() != DiaDaSemana.Domingo && data.getDay() != DiaDaSemana.Sabado;
    }
}

enum DiaDaSemana {
    Domingo,
    Segunda,
    Terca,
    Quarta,
    Quinta,
    Sexta,
    Sabado
}