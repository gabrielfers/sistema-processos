new Vue({
  el: '#app',
  data: {
    processos: [],
    mostrarFormulario: false,
    processoSelecionado: null,
    termoBusca: '',
    formProcesso: {
      numero_processo: '',
      data_entrada: '',
      competencia: '',
      objeto: '',
      interessado: '',
      orgao_gerador: '',
      responsavel: '',
      setor_atual: '',
      despacho: '',
      assinatura: '',
      observacao: '',
      valor_convenio: '',
      valor_contrapartida: '',
      concluido: false
    }
  },
  mounted() {
    this.carregarProcessos();
  },
  methods: {
    async carregarProcessos() {
      try {
        const response = await axios.get('/api/processos');
        this.processos = response.data;
        console.log('Processos carregados:', this.processos.length);
      } catch (error) {
        console.error('Erro ao carregar processos:', error);
        alert('Erro ao carregar processos: ' + (error.response?.data?.error || error.message));
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
          despacho: this.formProcesso.despacho || '',
          assinatura: this.formProcesso.assinatura || '',
          observacao: this.formProcesso.observacao || '',
          valor_convenio: this.formProcesso.valor_convenio ? parseFloat(this.formProcesso.valor_convenio) : 0,
          valor_contrapartida: this.formProcesso.valor_contrapartida ? parseFloat(this.formProcesso.valor_contrapartida) : 0,
          concluido: this.formProcesso.concluido || false
        };

        console.log('Enviando dados:', dadosProcesso);

        if (this.processoSelecionado) {
          // Editar processo existente
          await axios.put(`/api/processos/${this.processoSelecionado.id}`, dadosProcesso);
          alert('Processo atualizado com sucesso!');
        } else {
          // Criar novo processo
          await axios.post('/api/processos', dadosProcesso);
          alert('Processo cadastrado com sucesso!');
        }
        
        this.limparFormulario();
        this.mostrarFormulario = false;
        await this.carregarProcessos();
      } catch (error) {
        console.error('Erro completo:', error);
        console.error('Response data:', error.response?.data);
        
        let mensagemErro = 'Erro desconhecido';
        if (error.response?.data?.error) {
          mensagemErro = error.response.data.error;
          if (error.response.data.details) {
            mensagemErro += ': ' + error.response.data.details;
          }
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
        despacho: processo.despacho || '',
        assinatura: processo.assinatura || '',
        observacao: processo.observacao || '',
        valor_convenio: processo.valor_convenio || '',
        valor_contrapartida: processo.valor_contrapartida || '',
        concluido: processo.concluido || false
      };
      this.mostrarFormulario = true;
    },
    
    async excluirProcesso(id) {
      if (confirm('Tem certeza que deseja excluir este processo?')) {
        try {
          await axios.delete(`/api/processos/${id}`);
          alert('Processo excluído com sucesso!');
          await this.carregarProcessos();
        } catch (error) {
          console.error('Erro ao excluir processo:', error);
          alert('Erro ao excluir processo: ' + (error.response?.data?.error || error.message));
        }
      }
    },
    
    async buscarProcessos() {
      try {
        let url = '/api/processos';
        if (this.termoBusca.trim()) {
          url += `?busca=${encodeURIComponent(this.termoBusca)}`;
        }
        const response = await axios.get(url);
        this.processos = response.data;
      } catch (error) {
        console.error('Erro ao buscar processos:', error);
        alert('Erro ao buscar processos: ' + (error.response?.data?.error || error.message));
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
        despacho: '',
        assinatura: '',
        observacao: '',
        valor_convenio: '',
        valor_contrapartida: '',
        concluido: false
      };
      this.processoSelecionado = null;
    },
    
    formatarData(data) {
      if (!data) return '';
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    }
  }
});