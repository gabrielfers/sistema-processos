new Vue({
  el: '#app',
  data: {
    processos: [],
    mostrarFormulario: false,
    processoSelecionado: null,
    termoBusca: '',
    setores: ['Gabinete', 'Contabilidade', 'Controle Interno', 'Financeiro'],
    meses: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    objetos: [
      'Adiantamento',
      'Aluguel Imóveis',
      'Aluguel Veículos',
      'Carnaval',
      'Combustível',
      'Contas Pagamentos',
      'Convênios',
      'Diárias',
      'Dotação',
      'Eventos/Comunicação',
      'Fundações',
      'Obras',
      'Premiações Mestre Antônio',
      'Premiações Mestre Eduardo',
      'Softwares e Consultoria'
    ],
    buscaObjeto: '',
    mostrarOpcoesObjeto: false,
    formProcesso: {
      numero_processo: '',
      data_entrada: '',
      competencia: '',
      objeto: '',
      interessado: '',
      orgao_gerador: '',
      responsavel: '',
      setor_atual: '',
      descricao: '',
      observacao: '',
      valor_convenio: '',
      valor_recurso_proprio: '',
      valor_royalties: '',
      total: 0,
      concluido: false
    },
    filtros: {
      status: '',
      setor: '',
      competencia: '',
      data_inicio: '',
      data_fim: ''
    },
    mostrarFiltros: false,
    competenciasDisponiveis: [],
    logoError: false
  },
  computed: {
    totalCalculado() {
      const convenio = parseFloat(this.formProcesso.valor_convenio) || 0;
      const recursoProprio = parseFloat(this.formProcesso.valor_recurso_proprio) || 0;
      const royalties = parseFloat(this.formProcesso.valor_royalties) || 0;
      return convenio + recursoProprio + royalties;
    },
    objetosFiltrados() {
      if (!this.buscaObjeto) return this.objetos;
      return this.objetos.filter(objeto =>
        objeto.toLowerCase().includes(this.buscaObjeto.toLowerCase())
      );
    },
    filtrosAtivos() {
      return Object.values(this.filtros).some(filtro => filtro !== '');
    },
    contadorFiltros() {
      return Object.values(this.filtros).filter(filtro => filtro !== '').length;
    }
  },
  watch: {
    totalCalculado(newVal) {
      this.formProcesso.total = newVal;
    }
  },
  mounted() {
    this.carregarProcessos();
    this.carregarCompetencias();
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      if (!this.$refs.objetoContainer || !this.$refs.objetoContainer.contains(e.target)) {
        this.mostrarOpcoesObjeto = false;
      }
    });
  },
  methods: {
    async carregarProcessos() {
      try {
        let url = 'http://localhost:3000/processos';
        const params = new URLSearchParams();

        // Adicionar busca se existir
        if (this.termoBusca.trim()) {
          params.append('busca', this.termoBusca);
        }

        // Adicionar filtros
        Object.keys(this.filtros).forEach(key => {
          if (this.filtros[key]) {
            params.append(key, this.filtros[key]);
          }
        });

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await axios.get(url);
        this.processos = response.data;
      } catch (error) {
        console.error('Erro ao carregar processos:', error);
        alert('Erro ao carregar processos: ' + (error.response?.data?.error || error.message));
      }
    },

    async carregarCompetencias() {
      try {
        const response = await axios.get('http://localhost:3000/processos');
        const competencias = [...new Set(response.data
          .map(p => p.competencia)
          .filter(c => c && c.trim() !== '')
        )].sort();
        this.competenciasDisponiveis = competencias;
      } catch (error) {
        console.error('Erro ao carregar competências:', error);
      }
    },

    async salvarProcesso() {
      try {
        // Validação no frontend
        if (!this.formProcesso.numero_processo.trim()) {
          alert('Número do processo é obrigatório');
          return;
        }

        // Preparar dados para envio - tratar valores vazios
        const dadosProcesso = {
          numero_processo: this.formProcesso.numero_processo.trim(),
          data_entrada: this.formProcesso.data_entrada || '',
          competencia: this.formProcesso.competencia || '',
          objeto: this.formProcesso.objeto || '',
          interessado: this.formProcesso.interessado || '',
          orgao_gerador: this.formProcesso.orgao_gerador || '',
          responsavel: this.formProcesso.responsavel || '',
          setor_atual: this.formProcesso.setor_atual || '',
          descricao: this.formProcesso.descricao || '',
          observacao: this.formProcesso.observacao || '',
          valor_convenio: this.formProcesso.valor_convenio ? parseFloat(this.formProcesso.valor_convenio) : 0,
          valor_recurso_proprio: this.formProcesso.valor_recurso_proprio ? parseFloat(this.formProcesso.valor_recurso_proprio) : 0,
          valor_royalties: this.formProcesso.valor_royalties ? parseFloat(this.formProcesso.valor_royalties) : 0,
          concluido: this.formProcesso.concluido || false
        };

        if (this.processoSelecionado) {
          // Editar processo existente
          await axios.put(`http://localhost:3000/processos/${this.processoSelecionado.id}`, dadosProcesso);
          alert('Processo atualizado com sucesso!');
        } else {
          // Criar novo processo
          await axios.post('http://localhost:3000/processos', dadosProcesso);
          alert('Processo cadastrado com sucesso!');
        }

        this.limparFormulario();
        this.mostrarFormulario = false;
        await this.carregarProcessos();
      } catch (error) {
        let mensagemErro = 'Erro desconhecido';
        if (error.response?.data?.error) {
          mensagemErro = error.response.data.error;
        } else if (error.message) {
          mensagemErro = error.message;
        }

        alert('Erro ao salvar processo: ' + mensagemErro);
      }
    },

    editarProcesso(processo) {
      this.processoSelecionado = processo;
      this.formProcesso = {
        numero_processo: processo.numero_processo || '',
        data_entrada: processo.data_entrada || '',
        competencia: processo.competencia || '',
        objeto: processo.objeto || '',
        interessado: processo.interessado || '',
        orgao_gerador: processo.orgao_gerador || '',
        responsavel: processo.responsavel || '',
        setor_atual: processo.setor_atual || '',
        descricao: processo.descricao || '',
        observacao: processo.observacao || '',
        valor_convenio: processo.valor_convenio || '',
        valor_recurso_proprio: processo.valor_recurso_proprio || '',
        valor_royalties: processo.valor_royalties || '',
        total: processo.total || 0,
        concluido: processo.concluido || false
      };
      this.mostrarFormulario = true;
    },

    async excluirProcesso(id) {
      if (confirm('Tem certeza que deseja excluir este processo?')) {
        try {
          await axios.delete(`http://localhost:3000/processos/${id}`);
          alert('Processo excluído com sucesso!');
          await this.carregarProcessos();
        } catch (error) {
          alert('Erro ao excluir processo: ' + (error.response?.data?.error || error.message));
        }
      }
    },

    aplicarFiltros() {
      this.carregarProcessos();
    },

    limparFiltros() {
      this.filtros = {
        status: '',
        setor: '',
        competencia: '',
        data_inicio: '',
        data_fim: ''
      };
      this.carregarProcessos();
    },

    toggleFiltros() {
      this.mostrarFiltros = !this.mostrarFiltros;
    },

    buscarProcessos() {
      this.carregarProcessos();
    },

    selecionarObjeto(objeto) {
      this.formProcesso.objeto = objeto;
      this.buscaObjeto = '';
      this.mostrarOpcoesObjeto = false;
    },

    toggleOpcoesObjeto() {
      this.mostrarOpcoesObjeto = !this.mostrarOpcoesObjeto;
      if (this.mostrarOpcoesObjeto) {
        this.$nextTick(() => {
          this.$refs.buscaObjetoInput?.focus();
        });
      }
    },

    limparFormulario() {
      this.formProcesso = {
        numero_processo: '',
        data_entrada: '',
        competencia: '',
        objeto: '',
        interessado: '',
        orgao_gerador: '',
        responsavel: '',
        setor_atual: '',
        descricao: '',
        observacao: '',
        valor_convenio: '',
        valor_recurso_proprio: '',
        valor_royalties: '',
        total: 0,
        concluido: false
      };
      this.processoSelecionado = null;
      this.buscaObjeto = '';
      this.mostrarOpcoesObjeto = false;
    },

    formatarData(data) {
      if (!data) return '';
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    },

    handleLogoError() {
      this.logoError = true;
    }
  }
});